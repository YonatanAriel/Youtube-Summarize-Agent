const logger = require('../logger');
const config = require('../config');
const { summaryPrompt } = require('./prompts');
const { summarySchema } = require('./schema');
const { callGeminiAPI } = require('../api/gemini/summarize');
const { testGeminiConnection } = require('../api/gemini/test');

const BILLING_402_MESSAGE = 'Gemini API billing: prepay credits depleted (402) — top up in Google AI Studio';

function describeError(error) {
  const detail = error.response?.data?.error?.message || error.response?.data;
  if (!detail) return error.message;
  const text = typeof detail === 'string' ? detail : JSON.stringify(detail);
  return `${error.message} - ${text.slice(0, 300)}`;
}

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

      const summary = JSON.parse(responseText);
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

      if (error.response?.status === 402) {
        logger.error(BILLING_402_MESSAGE);
        throw new Error(BILLING_402_MESSAGE);
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
          logger.warn(`Gemini API error: ${describeError(error)}. Retrying...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        } else {
          logger.error(`Gemini API failed after ${maxRetries} attempts: ${describeError(error)}`);
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
    if (error.response?.status === 402) {
      throw new Error(BILLING_402_MESSAGE);
    }
    throw new Error(`Gemini API test failed: ${describeError(error)}`);
  }
}

module.exports = {
  summarizeUrl,
  testConnection
};
