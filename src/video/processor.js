const logger = require('../logger');
const { summarizeUrl } = require('../gemini/client');
const { sendMessage } = require('../telegram/client');
const db = require('../db');
const summaryFormatter = require('../summaryFormatter');

async function processVideo(video) {
  try {
    logger.info(`🎬 NEW VIDEO: "${video.title}"`);

    const summary = await summarizeUrl(video.url);

    const { english, hebrew } = summaryFormatter.formatSummary(video.title, video.url, summary);

    await sendMessage(english);
    
    await sendMessage(hebrew);

    await db.markProcessed(video.videoId, video.title);
  } catch (e) {
    logger.error(`Failed to process ${video.videoId}: ${e.message}`);
  }
}

module.exports = {
  processVideo
};
