const axios = require('axios');
const config = require('../../config');

async function callGeminiAPI(summaryPrompt, summarySchema, youtubeUrl) {
  // Use gemini-2.0-flash for more stable YouTube video analysis
  const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const response = await axios.post(
    geminiEndpoint,
    {
      contents: [
        {
          parts: [
            { text: summaryPrompt },
            { file_data: { file_uri: youtubeUrl } }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: summarySchema
      }
    },
    {
      headers: {
        'x-goog-api-key': config.geminiApiKey,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    }
  );

  return response;
}

module.exports = {
  callGeminiAPI
};
