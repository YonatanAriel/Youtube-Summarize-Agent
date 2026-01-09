const axios = require('axios');
const config = require('../../config');

async function getYoutubeVideoDetails(videoIds) {
  const detailsUrl = 'https://www.googleapis.com/youtube/v3/videos';
  const detailsParams = {
    key: config.youtubeApiKey,
    id: videoIds,
    part: 'liveStreamingDetails,status'
  };

  const response = await axios.get(detailsUrl, { params: detailsParams, timeout: 15000 });
  const videoDetails = {};
  
  response.data.items.forEach(item => {
    videoDetails[item.id] = item;
  });
  
  return videoDetails;
}

module.exports = {
  getYoutubeVideoDetails
};
