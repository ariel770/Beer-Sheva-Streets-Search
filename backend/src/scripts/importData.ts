import path from 'path';
import { ElasticSearchService } from '../services/ElasticSearchService';
import { CsvLoaderService } from '../services/CsvLoaderService';

const esService = new ElasticSearchService();
const csvLoader = new CsvLoaderService(esService);

const csvPath = path.resolve(__dirname, '../../../data/streets.csv');

csvLoader.loadCsv(csvPath)
    .then(() => {
        console.log('Data import completed successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Data import failed:', err);
        process.exit(1);
    });
