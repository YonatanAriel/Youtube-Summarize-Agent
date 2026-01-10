const axios = require('axios');
const config = require('../../config');
const logger = require('../../logger');

async function searchYoutubeVideos(publishedAfter) {
  const url = 'https://www.googleapis.com/youtube/v3/search';
  const params = {
    key: config.youtubeApiKey,
    channelId: config.youtubeChannelId,
    part: 'snippet',
    order: 'date',
    type: 'video',
    publishedAfter: publishedAfter,
    maxResults: 50,
    q: ' ' 
  };

  if (process.env.DEBUG === 'true') {
    logger.info(`[DEBUG] YouTube Search API call:`);
    logger.info(`[DEBUG] URL: ${url}`);
    logger.info(`[DEBUG] channelId: ${params.channelId}`);
    logger.info(`[DEBUG] publishedAfter: ${publishedAfter}`);
    logger.info(`[DEBUG] q parameter: "${params.q}"`);
  }

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    
    if (process.env.DEBUG === 'true') {
      logger.info(`[DEBUG] YouTube API response status: ${response.status}`);
      logger.info(`[DEBUG] Items returned: ${response.data.items ? response.data.items.length : 0}`);
    }
    
    return response.data.items || [];
  } catch (error) {
    logger.error(`[ERROR] YouTube API request failed: ${error.message}`);
    if (process.env.DEBUG === 'true') {
      logger.error(`[DEBUG] Error response: ${error.response?.data ? JSON.stringify(error.response.data) : 'No response data'}`);
      logger.error(`[DEBUG] Error status: ${error.response?.status}`);
    }
    throw error;
  }
}

module.exports = {
  searchYoutubeVideos
};
