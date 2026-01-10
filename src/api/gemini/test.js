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

async function testYouTubeVideoAnalysis(youtubeUrl) {
  const geminiEndpoint = process.env.GEMINI_ENDPOINT;
  
  const response = await axios.post(
    geminiEndpoint,
    {
      contents: [
        {
          parts: [
            { text: 'What is the title and main topic of this YouTube video? Answer in one sentence.' },
            {
              file_data: {
                file_uri: youtubeUrl
              }
            }
          ]
        }
      ]
    },
    {
      headers: {
        'x-goog-api-key': config.geminiApiKey,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    }
  );

  return response;
}

module.exports = {
  testGeminiConnection,
  testYouTubeVideoAnalysis
};
