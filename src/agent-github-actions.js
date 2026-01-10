const logger = require('./logger');
const { testConnection: testGemini } = require('./gemini/client');
const { testConnection: testTelegram } = require('./telegram/client');
const rssMonitor = require('./rssMonitor');
const db = require('./db');
const { processVideo } = require('./video/processor');

async function runOnce() {
  try {
    logger.info('GitHub Actions: Starting YouTube Summarizer...');

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
    const processed = await db.getAllProcessed();
    logger.info(`Loaded ${processed.length} previously processed videos`);

    // Fetch new videos
    const videos = await rssMonitor.checkNewVideos();
    logger.info(`Found ${videos.length} videos since last check`);

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
    process.exit(1);
  }
}

runOnce();
