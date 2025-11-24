// Elasticsearch connection 
const {Client} = require('@elastic/elasticsearch');

// Create a client instance
const esClient = new Client({
    node: 'http://localhost:9200',              // The URL where our docker container is listening 
});

// Fuction to check connection
const connectElasticsearch = async () => {
    try{
        const health = await esClient.cluster.health({});
        console.log(`Elasticsearch Connected: Status ${health.status}`);
    }
    catch(error){
        console.error('Elasticsearch Connection Error:', error);
    }
};

const createEmailIndex = async () => {
    const indexName = 'emails';

    // check if index already exists
    const indexExists = await esClient.indices.exists({index: indexName});

    if(!indexExists){
        await esClient.indices.create({
            index: indexName,
            body:{
                mappings:{
                    properties:{
                        userId: {type: 'keyword'},      // keyword = exact match (good for filtering)
                        accountId: {type: 'keyword'},
                        subject: {type: 'text'},        // text = full-text search (good for searching words)
                        from: {type: 'text'},
                        body: {type: 'text'},
                        date: {type: 'date'},
                        folder: {type: 'keyword'},
                        isRead: {type: 'boolean'}
                    }
                }
            }
        });
        console.log('Elasticsearch "emails" index created');
    }
};

module.exports = {esClient, connectElasticsearch, createEmailIndex};