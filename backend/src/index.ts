import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { ElasticSearchService } from './services/ElasticSearchService';
import { SearchController } from './controllers/SearchController';
import { UploadController } from './controllers/UploadController';
import { CsvLoaderService } from './services/CsvLoaderService';
import multer from 'multer';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const esService = new ElasticSearchService();
const searchController = new SearchController(esService);
const csvLoader = new CsvLoaderService(esService);
const uploadController = new UploadController(csvLoader);

const upload = multer({ storage: multer.memoryStorage() });
const csvPath = path.resolve(__dirname, '../../data/streets.csv');

app.get('/api/search', (req: any, res: any) => searchController.search(req, res));
app.get('/api/autocomplete', (req: any, res: any) => searchController.autocomplete(req, res));
app.delete('/api/streets/:id', (req: any, res: any) => searchController.deleteRecord(req, res));
app.post('/api/streets/upload', upload.single('file'), (req: any, res: any) => uploadController.uploadCsv(req, res));
app.delete('/api/streets', (req: any, res: any) => uploadController.clearAll(req, res));

app.listen(port, () => {
    console.log(`Backend service listening at http://localhost:${port}`);
});
