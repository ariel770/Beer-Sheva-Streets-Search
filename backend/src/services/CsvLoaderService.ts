import fs from 'fs';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import crypto from 'crypto';
import { ElasticSearchService } from './ElasticSearchService';
import { streetsMapping } from '../utils/mapping';

export class CsvLoaderService {
    constructor(public esService: ElasticSearchService) { }

    async loadCsv(filePath: string) {
        console.log(`Starting CSV load from ${filePath}...`);
        const stream = fs.createReadStream(filePath);
        return this.processStream(stream);
    }

    async loadCsvFromBuffer(buffer: Buffer) {
        console.log('Starting CSV load from buffer...');
        const stream = Readable.from(buffer.toString());
        return this.processStream(stream);
    }

    private async processStream(stream: any) {
        // Ensure index exists
        await this.esService.createIndexWithMapping(streetsMapping);

        const parser = stream.pipe(parse({
            columns: true,
            skip_empty_lines: true,
            trim: true
        }));

        let batch: any[] = [];
        const BATCH_SIZE = 1000;
        let totalIndexed = 0;

        for await (const record of parser) {
            // Helper to get value from Hebrew or English keys (handling BOM)
            const findValue = (obj: any, keys: string[]) => {
                for (const key of keys) {
                    if (obj[key] !== undefined) return obj[key];
                    const matchingKey = Object.keys(obj).find(k => k.endsWith(key));
                    if (matchingKey) return obj[matchingKey];
                }
                return '';
            };

            // Map data from CSV columns to search fields
            const name = findValue(record, ['שם ראשי', 'שם רחוב', 'street_name', 'שם מלא']);
            const neighborhood = findValue(record, ['שכונה', 'neighborhood']);
            const group = findValue(record, ['קבוצה', 'group']);
            const title = findValue(record, ['תואר', 'title']);
            const type = findValue(record, ['סוג', 'type']);
            const zip_code = findValue(record, ['מיקוד', 'zip_code']);

            record.street_name = record.street_name || name;
            record.neighborhood = record.neighborhood || neighborhood;
            record.group = record.group || group;
            record.title = record.title || title;
            record.type = record.type || type;
            record.zip_code = record.zip_code || zip_code;

            record.city = record.city || findValue(record, ['עיר', 'city']) || 'באר שבע';

            batch.push(record);

            if (batch.length >= BATCH_SIZE) {
                await this.esService.bulkIndex(batch, false);
                totalIndexed += batch.length;
                console.log(`Indexed batch of ${batch.length} (Total: ${totalIndexed})...`);
                batch = [];
            }
        }

        // Final batch
        if (batch.length > 0) {
            await this.esService.bulkIndex(batch, true); // Refresh on last batch
            totalIndexed += batch.length;
            console.log(`Final batch indexed. Total: ${totalIndexed}.`);
        } else if (totalIndexed > 0) {
            // If we had batches but the last one was empty, force a refresh
            await this.esService.refreshIndex();
        } else {
            console.log('No records found in CSV.');
        }
    }
}
