const {esClient} = require('../config/elasticsearch');

// 1. Save (Index) a single email
const indexEmail = async (emailData) => {
    try{
        // We check if this specific email ( by messageId) already exists to avoid duplicates
        // Note: We use the emails unique messageId as the Elasticsearch id
        await esClient.index({
            index: 'emails',
            id: emailData.messageId,   // <-- document id
            document: emailData
        });
        console.log(`Indexed Email: ${emailData.subject}`);
    }
    catch(error){
        console.error("Error indexing email:", error)
    }
};


// 2. Search Emails
const searchEmails = async (userId, query) => {
    try{
        const response = await esClient.search({
            body:{
                query:{
                    bool:{
                        must:[
                            {term: {userId: userId}},   // Only Show emails for this user
                            {
                                multi_match:{
                                    query: query,
                                    fields: ['subject', 'body', 'from'], // Search in these fields
                                    fuzziness: 'AUTO',  // Handle typos (eg: 'meting' finds "meetings")
                                },
                            },
                        ],
                    },
                },
            },
        });

        // Extract just the document data from the comples ES response
        return response.hits.hits.map((hit) => hit._source);
    }
    catch(error){
        console.error("Error Searching Emails:", error);
        return [];
    }
};

module.exports = {indexEmail, searchEmails};