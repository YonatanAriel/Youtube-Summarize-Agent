const axios = require('axios');
const config = require('../../config');
const logger = require('../../logger');

async function callGeminiAPI(summaryPrompt, summarySchema, youtubeUrl) {
  const geminiEndpoint = process.env.GEMINI_ENDPOINT;

  if (process.env.DEBUG === 'true') {
    logger.info(`[DEBUG] Calling Gemini API with URL: ${youtubeUrl}`);
    logger.info(`[DEBUG] Using schema-based response format`);
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
      const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        logger.info(`[DEBUG] Response preview: ${responseText.substring(0, 200)}...`);
      }
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

module.exports = {
  callGeminiAPI
};
