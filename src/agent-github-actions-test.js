const logger = require('./logger');
const { testConnection: testGemini } = require('./gemini/client');
const { testConnection: testTelegram } = require('./telegram/client');
const { sendMessage } = require('./telegram/client');
const rssMonitor = require('./rssMonitor');
const db = require('./db');
const { processVideo } = require('./video/processor');

async function runTestMode() {
  try {
    logger.info('GitHub Actions TEST MODE: Starting YouTube Summarizer...');

    // Validate API connections
    try {
      await testGemini();
      await testTelegram();
    } catch (e) {
      logger.error(`API validation failed: ${e.message}`);
      process.exit(1);
    }

    // Load database
    await db.init();
    logger.info('Database loaded');

    // Fetch latest videos (ignore last check time)
    const videos = await rssMonitor.checkNewVideos();
    logger.info(`Found ${videos.length} videos from channel`);

    if (videos.length === 0) {
      logger.warn('No videos found on channel');
      await sendMessage('⚠️ YouTube Summarizer Test: No videos found on channel');
      process.exit(0);
    }

    // Process the latest video (first in list) regardless of whether it's been processed
    const latestVideo = videos[0];
    logger.info(`TEST MODE: Processing latest video: ${latestVideo.title}`);
    
    try {
      await processVideo(latestVideo);
      logger.info(`✓ Successfully processed: ${latestVideo.title}`);
    } catch (e) {
      logger.error(`Failed to process video: ${e.message}`);
      throw e;
    }

    // Send success message
    const successMessage = `✅ <b>YouTube Summarizer is Online!</b>\n\n` +
      `Test run completed successfully.\n` +
      `Latest video processed: <b>${latestVideo.title}</b>\n\n` +
      `The agent will run automatically every day at 03:12 UTC.`;
    
    await sendMessage(successMessage);
    logger.info('✓ Success message sent to Telegram');
    logger.info('GitHub Actions TEST MODE: Workflow complete');
    process.exit(0);

  } catch (e) {
    logger.error(`Fatal error: ${e.message}`);
    process.exit(1);
  }
}

runTestMode();
