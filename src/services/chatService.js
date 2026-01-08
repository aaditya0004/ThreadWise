const { esClient } = require('../config/elasticsearch');
const axios = require('axios');

const chatWithInbox = async (userId, query) => {
  try {
    console.log(`💬 User asking: "${query}"`);

    // 1. SEARCH: Find relevant emails in Elasticsearch
    // We search for the user's query in the subject and body
    const searchResponse = await esClient.search({
      index: 'emails',
      body: {
        query: {
          bool: {
            must: [
              { term: { userId: userId.toString() } }, // Only search THIS user's emails
              {
                multi_match: {
                  query: query,
                  fields: ['subject', 'body', 'from', 'category'],
                  fuzziness: 'AUTO' // Handle typos
                }
              }
            ]
          }
        },
        size: 5 // Limit to top 5 most relevant emails to save AI processing time
      }
    });

    const hits = searchResponse.hits.hits;
console.log(
  'ES hits:',
  searchResponse.hits.hits.length
);


    // If no emails found, return early
    if (hits.length === 0) {
      return "I couldn't find any emails related to that in your inbox.";
    }

    // 2. CONTEXT PREPARATION: Combine email snippets into a single text block
    const context = hits.map((hit, index) => {
      const source = hit._source;
      return `
      [Email ${index + 1}]
      From: ${source.from}
      Subject: ${source.subject}
      Date: ${source.date}
      Body Snippet: ${source.body.substring(0, 500)}... 
      `;
    }).join('\n');

    // 3. GENERATION: Send context + question to Ollama
    const prompt = `
    You are a helpful AI Email Assistant. 
    Answer the user's question based ONLY on the email context provided below.
    If the answer is not in the emails, say "I don't see that information in your recent emails."
    Keep your answer concise and professional.

    --- EMAILS CONTEXT ---
    ${context}
    ----------------------

    User Question: "${query}"
    AI Answer:
    `;

    // Call Local Ollama
    const aiResponse = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: 'llama3.2', // Make sure this matches the model you have installed
      prompt: prompt,
      stream: false
    });

    const answer = aiResponse.data.response.trim();
    return answer;

  } catch (error) {
    console.error('Chat RAG Error:', error.message);
    throw new Error('Failed to generate answer');
  }
};

module.exports = { chatWithInbox };