const logger = require('./logger');
const { summarizeUrl, testConnection: testGemini } = require('./gemini/client');
const { sendMessage, testConnection: testTelegram } = require('./telegram/client');
const rssMonitor = require('./rssMonitor');
const db = require('./db');
const { processVideo } = require('./video/processor');
const { testMode } = require('./test/testMode');
const cron = require('node-cron');

let cronJob = null;

async function main() {
  try {
    logger.info('Agent starting...');

    try {
      await testGemini();
      await testTelegram();
    } catch (e) {
      logger.error(`API key validation failed: ${e.message}`);
      process.exit(1);
    }

    await db.init();
    const processed = await db.getAllProcessed();

    const recent = await rssMonitor.checkNewVideos();

    for (const video of recent) {
      if (!processed.includes(video.videoId)) {
        await processVideo(video);
      }
    }

    const cronExpression = `00 13 * * *`;
    logger.info(`Agent ready. Monitoring for new videos...`);

    cronJob = cron.schedule(cronExpression, async () => {
      try {
        const videos = await rssMonitor.checkNewVideos();

        let newCount = 0;
        for (const video of videos) {
          if (!(await db.isProcessed(video.videoId))) {
            await processVideo(video);
            newCount++;
          }
        }
      } catch (e) {
        logger.warn(`Cron job error: ${e.message}`);
      }
    });
  } catch (e) {
    logger.error(`Fatal startup error: ${e.message}`);
    process.exit(1);
  }
}

if (process.argv.includes('--test')) {
  testMode().catch((e) => {
    logger.error(`Uncaught error: ${e.message}`);
    process.exit(1);
  });
} else {
  main().catch((e) => {
    logger.error(`Uncaught error: ${e.message}`);
    process.exit(1);
  });
}

process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  if (cronJob) {
    cronJob.stop();
  }
  process.exit(0);
});
