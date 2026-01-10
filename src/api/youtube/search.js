const axios = require('axios');
const config = require('../../config');
const logger = require('../../logger');

async function getChannelUploadsPlaylist(channelId) {
  const url = 'https://www.googleapis.com/youtube/v3/channels';
  const params = {
    key: config.youtubeApiKey,
    id: channelId,
    part: 'contentDetails'
  };

  if (process.env.DEBUG === 'true') {
    logger.info(`[DEBUG] Getting uploads playlist for channel: ${channelId}`);
  }

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const uploadsPlaylistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;
    
    if (process.env.DEBUG === 'true') {
      logger.info(`[DEBUG] Uploads playlist ID: ${uploadsPlaylistId}`);
    }
    
    return uploadsPlaylistId;
  } catch (error) {
    logger.error(`[ERROR] Failed to get channel uploads playlist: ${error.message}`);
    if (process.env.DEBUG === 'true') {
      logger.error(`[DEBUG] Error response: ${error.response?.data ? JSON.stringify(error.response.data) : 'No response data'}`);
    }
    throw error;
  }
}

async function getPlaylistVideos(playlistId, publishedAfter) {
  const url = 'https://www.googleapis.com/youtube/v3/playlistItems';
  const params = {
    key: config.youtubeApiKey,
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 50,
    order: 'date'
  };

  if (process.env.DEBUG === 'true') {
    logger.info(`[DEBUG] Fetching playlist items from: ${playlistId}`);
    logger.info(`[DEBUG] publishedAfter: ${publishedAfter}`);
  }

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    
    if (process.env.DEBUG === 'true') {
      logger.info(`[DEBUG] Playlist API response status: ${response.status}`);
      logger.info(`[DEBUG] Items returned: ${response.data.items ? response.data.items.length : 0}`);
    }
    
    // Filter by publishedAfter date
    const items = response.data.items || [];
    const filteredItems = items.filter(item => {
      const publishedAt = new Date(item.snippet.publishedAt);
      return publishedAt > new Date(publishedAfter);
    });

    if (process.env.DEBUG === 'true') {
      logger.info(`[DEBUG] After date filtering: ${filteredItems.length} items`);
    }

    return filteredItems;
  } catch (error) {
    logger.error(`[ERROR] Playlist API request failed: ${error.message}`);
    if (process.env.DEBUG === 'true') {
      logger.error(`[DEBUG] Error response: ${error.response?.data ? JSON.stringify(error.response.data) : 'No response data'}`);
      logger.error(`[DEBUG] Error status: ${error.response?.status}`);
    }
    throw error;
  }
}

async function searchYoutubeVideos(publishedAfter) {
  try {
    // Step 1: Get the uploads playlist ID for the channel
    const uploadsPlaylistId = await getChannelUploadsPlaylist(config.youtubeChannelId);
    
    // Step 2: Get videos from the uploads playlist
    const items = await getPlaylistVideos(uploadsPlaylistId, publishedAfter);
    
    // Convert playlist items to search result format
    return items.map(item => ({
      id: {
        videoId: item.snippet.resourceId.videoId
      },
      snippet: {
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails
      }
    }));
  } catch (error) {
    logger.error(`[ERROR] Failed to fetch YouTube videos: ${error.message}`);
    throw error;
  }
}

module.exports = {
  searchYoutubeVideos
};
