const axios = require('axios');
const config = require('../../config');
const logger = require('../../logger');
const { getYouTubeTranscript } = require('../youtube/transcript');

async function callGeminiAPI(summaryPrompt, summarySchema, youtubeUrl) {
  const geminiEndpoint = process.env.GEMINI_ENDPOINT;

  // Extract video ID from URL
  const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) {
    throw new Error(`Could not extract video ID from URL: ${youtubeUrl}`);
  }

  if (process.env.DEBUG === 'true') {
    logger.info(`[DEBUG] Fetching transcript for video: ${videoId}`);
  }

  // Get the transcript instead of using the URL
  let transcript;
  try {
    transcript = await getYouTubeTranscript(videoId);
    if (process.env.DEBUG === 'true') {
      logger.info(`[DEBUG] Transcript fetched successfully, length: ${transcript.length} characters`);
    }
  } catch (error) {
    logger.warn(`[WARN] Could not fetch transcript: ${error.message}. Falling back to URL-based analysis.`);
    transcript = null;
  }

  // Build the prompt with transcript or URL
  let finalPrompt;
  if (transcript) {
    finalPrompt = `${summaryPrompt}\n\nHere is the video transcript:\n\n${transcript}`;
  } else {
    finalPrompt = summaryPrompt;
  }

  try {
    const response = await axios.post(
      geminiEndpoint,
      {
        contents: [
          {
            parts: [
              { text: finalPrompt },
              ...(transcript ? [] : [{ file_data: { file_uri: youtubeUrl } }])
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

module.exports = {
  callGeminiAPI
};
