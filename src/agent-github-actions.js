const logger = require('./logger');
const { testConnection: testGemini } = require('./gemini/client');
const { testConnection: testTelegram } = require('./telegram/client');
const rssMonitor = require('./rssMonitor');
const db = require('./db');
const { processVideo } = require('./video/processor');

async function runOnce() {
  try {
    logger.info('GitHub Actions: Starting YouTube Summarizer...');
    
    if (process.env.DEBUG === 'true') {
      logger.info('[DEBUG] Debug mode enabled');
      logger.info(`[DEBUG] YOUTUBE_API_KEY: ${process.env.YOUTUBE_API_KEY ? 'SET' : 'NOT SET'}`);
      logger.info(`[DEBUG] GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET'}`);
      logger.info(`[DEBUG] TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET'}`);
    }

    // Validate API connections
    try {
      logger.info('Testing Gemini API connection...');
      await testGemini();
      logger.info('✓ Gemini API connection successful');
      
      logger.info('Testing Telegram API connection...');
      await testTelegram();
      logger.info('✓ Telegram API connection successful');
    } catch (e) {
      logger.error(`API validation failed: ${e.message}`);
      process.exit(1);
    }

    // Load database
    logger.info('Loading database...');
    await db.init();
    const processed = await db.getAllProcessed();
    logger.info(`Loaded ${processed.length} previously processed videos`);

    // Fetch new videos
    logger.info('Fetching new videos from YouTube...');
    const videos = await rssMonitor.checkNewVideos();
    logger.info(`Found ${videos.length} videos since last check`);
    
    if (process.env.DEBUG === 'true' && videos.length > 0) {
      logger.info(`[DEBUG] First video: ${videos[0].title}`);
    }

    // Process each new video
    let processedCount = 0;
    for (const video of videos) {
      if (!processed.includes(video.videoId)) {
        logger.info(`Processing: ${video.title}`);
        await processVideo(video);
        processedCount++;
      }
    }

    logger.info(`✓ Processed ${processedCount} new videos`);
    logger.info('GitHub Actions: Workflow complete');
    process.exit(0);

  } catch (e) {
    logger.error(`Fatal error: ${e.message}`);
    if (process.env.DEBUG === 'true') {
      logger.error(`[DEBUG] Stack trace: ${e.stack}`);
    }
    process.exit(1);
  }
}

runOnce();
