function timestampToSeconds(timestamp) {
  const parts = timestamp.split(':').map(p => parseInt(p, 10));
  
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  return 0;
}

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatLogTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function createTimestampLink(videoUrl, timestamp) {
  const seconds = timestampToSeconds(timestamp);
  if (seconds === 0) return videoUrl;
  
  const separator = videoUrl.includes('?') ? '&' : '?';
  return `${videoUrl}${separator}t=${seconds}s`;
}

module.exports = {
  timestampToSeconds,
  formatTimestamp,
  formatLogTimestamp,
  createTimestampLink
};
