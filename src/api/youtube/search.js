const axios = require('axios');
const config = require('../../config');

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

  const response = await axios.get(url, { params, timeout: 15000 });
  return response.data.items || [];
}

module.exports = {
  searchYoutubeVideos
};
