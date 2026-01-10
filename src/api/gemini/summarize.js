const axios = require('axios');
const config = require('../../config');
const logger = require('../../logger');

async function callGeminiAPI(summaryPrompt, summarySchema, youtubeUrl) {
  const geminiEndpoint = process.env.GEMINI_ENDPOINT;

  if (process.env.DEBUG === 'true') {
    logger.info(`[DEBUG] Calling Gemini API with URL: ${youtubeUrl}`);
  }

  try {
    const response = await axios.post(
      geminiEndpoint,
      {
        contents: [
          {
            parts: [
              { 
                text: summaryPrompt
              },
              {
                file_data: {
                  file_uri: youtubeUrl
                }
              }
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

    if (process.env.DEBUG === 'true') {
      logger.info(`[DEBUG] Gemini API response status: ${response.status}`);
    }

    return response;
  } catch (error) {
    logger.error(`[ERROR] Gemini API call failed: ${error.message}`);
    if (process.env.DEBUG === 'true') {
      logger.error(`[DEBUG] Error response: ${error.response?.data ? JSON.stringify(error.response.data) : 'No response data'}`);
    }
    throw error;
  }
}

module.exports = {
  callGeminiAPI
};
