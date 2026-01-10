const logger = require('../logger');
const { summarizeUrl } = require('../gemini/client');
const { sendMessage } = require('../telegram/client');
const summaryFormatter = require('../summaryFormatter');

async function testMode() {
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  logger.info('🧪 TEST MODE: Processing single video');
  
  try {
    const summary = await summarizeUrl(testUrl);

    const htmlMessage = summaryFormatter.formatSummary('Test Video', testUrl, summary);

    await sendMessage(htmlMessage);
    logger.info('✅ TEST PASSED!');
  } catch (e) {
    logger.error(`❌ TEST FAILED: ${e.message}`);
    process.exit(1);
  }
}

module.exports = {
  testMode
};
