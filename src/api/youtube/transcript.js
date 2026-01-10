const axios = require('axios');
const logger = require('../../logger');

async function getYouTubeTranscript(videoId) {
  try {
    // Fetch the video page to get the initial data
    const pageResponse = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      }
    );

    // Extract the initial data from the page
    const initialDataMatch = pageResponse.data.match(/var ytInitialData = ({.*?});/);
    if (!initialDataMatch) {
      throw new Error('Could not find initial data in page');
    }

    const initialData = JSON.parse(initialDataMatch[1]);
    
    // Try to find captions in the initial data
    const captions = initialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents
      ?.find(item => item.videoPrimaryInfoRenderer)
      ?.videoPrimaryInfoRenderer?.title?.runs?.[0]?.text;

    if (!captions) {
      throw new Error('Could not find captions in initial data');
    }

    // Fallback: try to get auto-generated captions
    const captionTracksMatch = pageResponse.data.match(/"captionTracks":\s*(\[.*?\])/);
    if (captionTracksMatch) {
      const captionTracks = JSON.parse(captionTracksMatch[1]);
      if (captionTracks.length > 0) {
        const captionUrl = captionTracks[0].baseUrl;
        const captionResponse = await axios.get(captionUrl, { timeout: 10000 });
        
        // Parse XML captions
        const textMatches = captionResponse.data.match(/<text[^>]*>([^<]+)<\/text>/g);
        if (textMatches) {
          const transcript = textMatches
            .map(text => text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'"))
            .join(' ');
          return transcript;
        }
      }
    }

    throw new Error('Could not retrieve transcript');
  } catch (error) {
    logger.warn(`Failed to get transcript: ${error.message}`);
    throw new Error(`Could not retrieve transcript for video ${videoId}: ${error.message}`);
  }
}

module.exports = {
  getYouTubeTranscript
};
