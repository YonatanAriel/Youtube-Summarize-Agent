const logger = require('../logger');

function filterVideos(videos) {
  const now = new Date();
  
  return videos
    .filter(video => {
      const liveDetails = video.details?.liveStreamingDetails;
      
      if (liveDetails?.scheduledStartTime) {
        const scheduledTime = new Date(liveDetails.scheduledStartTime);
        if (scheduledTime > now) {
          logger.debug(`Skipping scheduled premiere: ${video.title}`);
          return false;
        }
      }
      
      if (liveDetails?.actualStartTime && !liveDetails?.actualEndTime) {
        logger.debug(`Skipping live video: ${video.title}`);
        return false;
      }
      
      return true;
    })
    .map(({ details, ...video }) => video);
}

module.exports = {
  filterVideos
};
