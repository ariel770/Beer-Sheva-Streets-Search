import { Request, Response } from 'express';
import { CsvLoaderService } from '../services/CsvLoaderService';

export class UploadController {
    constructor(private csvLoader: CsvLoaderService) { }

    async uploadCsv(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // We can pass the buffer directly to a new method in CsvLoaderService
            await this.csvLoader.loadCsvFromBuffer(req.file.buffer);

            res.status(200).json({ message: 'File uploaded and indexed successfully' });
        } catch (error: any) {
            console.error('Upload failed:', error);
            res.status(500).json({ error: 'Failed to process file', details: error.message });
        }
    }

    async clearAll(req: Request, res: Response) {
        try {
            await this.csvLoader.esService.truncateIndex();
            res.status(200).json({ message: 'All records deleted successfully' });
        } catch (error: any) {
            console.error('Clear failed:', error);
            res.status(500).json({ error: 'Failed to delete records', details: error.message });
        }
    }
}
