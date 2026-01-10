const logger = require('./logger');
const { getLastCheckTime, saveLastCheckTime } = require('./youtube/checkTime');
const { fetchNewVideos, fetchVideoDetails, mapToVideoObjects } = require('./youtube/fetcher');
const { filterVideos } = require('./youtube/videoFilter');

async function checkNewVideos() {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const lastCheck = getLastCheckTime();
      const publishedAfter = lastCheck.toISOString();
      
      if (process.env.DEBUG === 'true') {
        logger.info(`[DEBUG] RSS Monitor attempt ${attempt}/${maxRetries}`);
        logger.info(`[DEBUG] Last check time: ${lastCheck.toISOString()}`);
        logger.info(`[DEBUG] Fetching videos published after: ${publishedAfter}`);
      }
      
      const items = await fetchNewVideos(publishedAfter);
      
      if (process.env.DEBUG === 'true') {
        logger.info(`[DEBUG] Fetch returned ${items ? items.length : 0} items`);
      }
      
      if (!items || items.length === 0) {
        logger.info('No new videos found');
        saveLastCheckTime();
        return [];
      }

      const videoIds = items.map(item => item.id.videoId).join(',');
      const videoDetails = await fetchVideoDetails(videoIds);
      
      const videoObjects = mapToVideoObjects(items, videoDetails);
      const filteredVideos = filterVideos(videoObjects);

      if (process.env.DEBUG === 'true') {
        logger.info(`[DEBUG] After filtering: ${filteredVideos.length} videos`);
      }

      saveLastCheckTime();
      return filteredVideos;
    } catch (error) {
      lastError = error;
      logger.debug(`YouTube API attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        logger.info(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  logger.error(`YouTube API fetch failed after ${maxRetries} attempts: ${lastError.message}`);
  if (process.env.DEBUG === 'true') {
    logger.error(`[DEBUG] Final error: ${lastError.stack}`);
  }
  return [];
}

module.exports = {
  checkNewVideos
};
