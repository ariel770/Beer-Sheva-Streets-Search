import esClient from '../config/elasticsearch';
import { StreetRecord } from '../models/StreetRecord';

export class ElasticSearchService {
    private indexName = 'streets';

    async searchFree(query: string) {
        const result = await esClient.search({
            index: this.indexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { street_name: query } }
                        ],
                        filter: [
                            { term: { is_deleted: false } }
                        ]
                    }
                }
            }
        });
        return result.hits.hits;
    }

    async searchAtLeastOne(query: string) {
        // Search at least one word in all fields
        const result = await esClient.search({
            index: this.indexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { multi_match: { query, fields: ['*'], operator: 'or' } }
                        ],
                        filter: [
                            { term: { is_deleted: false } }
                        ]
                    }
                }
            }
        });
        return result.hits.hits;
    }

    async searchFullPhrase(query: string) {
        // Search exact phrase in all fields
        const result = await esClient.search({
            index: this.indexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { multi_match: { query, fields: ['*'], type: 'phrase' } }
                        ],
                        filter: [
                            { term: { is_deleted: false } }
                        ]
                    }
                }
            }
        });
        return result.hits.hits;
    }

    async softDelete(id: string) {
        await esClient.update({
            index: this.indexName,
            id: id,
            body: {
                doc: { is_deleted: true }
            }
        });
    }

    async bulkIndex(records: any[], refresh: boolean = true) {
        const body = records.flatMap(doc => {
            const action = { index: { _index: this.indexName } } as any;
            if (doc.id) {
                action.index._id = doc.id;
            }
            return [action, { ...doc, is_deleted: false }];
        });

        const { errors, items } = await esClient.bulk({ refresh, body });
        if (errors) {
            const errorDetails = items.filter((item: any) => item.index && item.index.error);
            console.error('Bulk index errors count:', errorDetails.length);
            console.error('First error example:', JSON.stringify(errorDetails[0], null, 2));
        }
    }

    async refreshIndex() {
        await esClient.indices.refresh({ index: this.indexName });
    }

    async createIndexWithMapping(mapping: any) {
        const indexExists = await esClient.indices.exists({ index: this.indexName });
        if (!indexExists) {
            await esClient.indices.create({
                index: this.indexName,
                body: mapping
            });
            console.log(`Index ${this.indexName} created.`);
        }
    }

    async truncateIndex() {
        const indexExists = await esClient.indices.exists({ index: this.indexName });
        if (indexExists) {
            await esClient.indices.delete({ index: this.indexName });
        }
        // Recreate the index immediately with mapping so stats/count work
        const { streetsMapping } = await import('../utils/mapping');
        await this.createIndexWithMapping(streetsMapping);
    }
}
