import { ElasticSearchService } from '../services/ElasticSearchService';

// Mocking the Elasticsearch Client
jest.mock('@elastic/elasticsearch', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            indices: {
                exists: jest.fn().mockResolvedValue(true),
                create: jest.fn().mockResolvedValue({}),
                delete: jest.fn().mockResolvedValue({}),
            },
            bulk: jest.fn().mockResolvedValue({ errors: false, items: [] }),
            search: jest.fn().mockResolvedValue({
                body: {
                    hits: {
                        total: { value: 0 },
                        hits: []
                    }
                }
            }),
        })),
    };
});

describe('ElasticSearchService', () => {
    let service: ElasticSearchService;

    beforeEach(() => {
        service = new ElasticSearchService();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should have the correct index name', () => {
        expect(service['indexName']).toBe('streets');
    });
});
