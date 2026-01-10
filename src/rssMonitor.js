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
      
      const items = await fetchNewVideos(publishedAfter);
      
      if (!items || items.length === 0) {
        saveLastCheckTime();
        return [];
      }

      const videoIds = items.map(item => item.id.videoId).join(',');
      const videoDetails = await fetchVideoDetails(videoIds);
      
      const videoObjects = mapToVideoObjects(items, videoDetails);
      const filteredVideos = filterVideos(videoObjects);

      saveLastCheckTime();
      return filteredVideos;
    } catch (error) {
      lastError = error;
      logger.debug(`YouTube API attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  logger.error(`YouTube API fetch failed after ${maxRetries} attempts: ${lastError.message}`);
  return [];
}

module.exports = {
  checkNewVideos
};
