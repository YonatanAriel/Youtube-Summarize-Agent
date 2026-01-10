const logger = require('../logger');
const config = require('../config');
const { summaryPrompt } = require('./prompts');
const { summarySchema } = require('./schema');
const { callGeminiAPI } = require('../api/gemini/summarize');
const { testGeminiConnection } = require('../api/gemini/test');

async function summarizeUrl(youtubeUrl) {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const response = await callGeminiAPI(summaryPrompt, summarySchema, youtubeUrl);

      const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('No summary text in Gemini response');
      }

      // Log the raw response for debugging
      if (process.env.DEBUG === 'true') {
        logger.info(`[DEBUG] Raw Gemini response: ${responseText.substring(0, 300)}...`);
      }

      const summary = JSON.parse(responseText);
      
      // Validate that we got actual video content, not generic template
      const englishOverview = summary.english?.overview || '';
      const isGenericResponse = englishOverview.toLowerCase().includes('time management') || 
                                englishOverview.toLowerCase().includes('productivity') ||
                                englishOverview.toLowerCase().includes('habit');
      
      if (isGenericResponse && process.env.DEBUG === 'true') {
        logger.warn(`[DEBUG] WARNING: Response appears to be generic template, not actual video content`);
      }

      return {
        english: summary.english,
        hebrew: summary.hebrew,
        tokens: response.data.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logger.error(`Gemini API: Invalid API key (${error.response.status})`);
        throw error;
      }

      if (error.response?.status === 429) {
        retries++;
        if (retries < maxRetries) {
          logger.warn(`Gemini API: Rate limited. Retrying in 60 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 60000));
        } else {
          logger.error(`Gemini API: Rate limited after ${maxRetries} retries`);
          throw error;
        }
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        logger.error(`Gemini API: Request timeout`);
        throw error;
      } else {
        retries++;
        if (retries < maxRetries) {
          const backoffMs = Math.pow(2, retries - 1) * 1000;
          logger.warn(`Gemini API error: ${error.message}. Retrying...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        } else {
          logger.error(`Gemini API failed after ${maxRetries} attempts: ${error.message}`);
          throw error;
        }
      }
    }
  }
}

async function testConnection() {
  try {
    const response = await testGeminiConnection();

    if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(`Gemini API key is invalid`);
    }
    throw new Error(`Gemini API test failed: ${error.message}`);
  }
}

module.exports = {
  summarizeUrl,
  testConnection
};
