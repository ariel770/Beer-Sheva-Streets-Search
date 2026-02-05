export const streetsMapping = {
    settings: {
        index: {
            number_of_shards: 3,
            number_of_replicas: 0
        }
    },
    mappings: {
        properties: {
            id: { type: 'keyword' },
            street_name: {
                type: 'text',
                fields: {
                    keyword: { type: 'keyword', ignore_above: 256 }
                }
            },
            neighborhood: { type: 'text' },
            city: { type: 'text' },
            type: { type: 'keyword' },
            zip_code: { type: 'keyword' },
            is_deleted: { type: 'boolean' }
        }
    }
};
