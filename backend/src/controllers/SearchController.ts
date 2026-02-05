import { Request, Response } from 'express';
import { ElasticSearchService } from '../services/ElasticSearchService';

export class SearchController {
    constructor(private esService: ElasticSearchService) { }

    async search(req: Request, res: Response) {
        const { q, type } = req.query;
        const query = q as string;
        const searchType = type as string;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        try {
            let results;
            switch (searchType) {
                case 'at-least-one':
                    results = await this.esService.searchAtLeastOne(query);
                    break;
                case 'full-phrase':
                    results = await this.esService.searchFullPhrase(query);
                    break;
                case 'free':
                default:
                    results = await this.esService.searchFree(query);
                    break;
            }

            const formattedResults = results.map((hit: any) => ({
                id: hit._id,
                ...hit._source
            }));

            res.json(formattedResults);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async deleteRecord(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        try {
            await this.esService.softDelete(id);
            res.json({ success: true });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}
