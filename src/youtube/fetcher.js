const { searchYoutubeVideos } = require('../api/youtube/search');
const { getYoutubeVideoDetails } = require('../api/youtube/details');

async function fetchNewVideos(publishedAfter) {
  const items = await searchYoutubeVideos(publishedAfter);
  return items;
}

async function fetchVideoDetails(videoIds) {
  const videoDetails = await getYoutubeVideoDetails(videoIds);
  return videoDetails;
}

function mapToVideoObjects(items, videoDetails) {
  return items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    publishedAt: new Date(item.snippet.publishedAt),
    details: videoDetails[item.id.videoId]
  }));
}

module.exports = {
  fetchNewVideos,
  fetchVideoDetails,
  mapToVideoObjects
};
