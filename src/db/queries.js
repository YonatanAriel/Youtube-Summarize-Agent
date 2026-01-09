const storage = require('./storage');

async function isProcessed(videoId) {
  return storage.getProcessedVideos().some((v) => v.videoId === videoId);
}

async function markProcessed(videoId, title = '') {
  const videos = storage.getProcessedVideos();
  if (!videos.some((v) => v.videoId === videoId)) {
    videos.push({
      videoId,
      title,
      processedAt: new Date().toISOString()
    });
    storage.saveDatabase();
  }
}

async function getAllProcessed() {
  return storage.getProcessedVideos().map((v) => v.videoId);
}

module.exports = {
  isProcessed,
  markProcessed,
  getAllProcessed
};
