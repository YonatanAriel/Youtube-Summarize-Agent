const axios = require('axios');
const config = require('../../config');

async function testGeminiConnection() {
  const geminiEndpoint = process.env.GEMINI_ENDPOINT;
  
  const response = await axios.post(
    geminiEndpoint,
    {
      contents: [
        {
          parts: [
            { text: 'Say "OK" if you can read this.' }
          ]
        }
      ]
    },
    {
      headers: {
        'x-goog-api-key': config.geminiApiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );

  return response;
}

module.exports = {
  testGeminiConnection
};
