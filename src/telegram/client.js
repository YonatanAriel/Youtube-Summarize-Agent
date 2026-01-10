const logger = require('../logger');
const { splitMessage } = require('./splitMessage');
const { sendSingleMessage } = require('./sendSingleMessage');
const { addToRetryQueue, processRetryQueue } = require('./retryQueue');
const { testConnection } = require('./testConnection');

async function sendMessage(htmlText) {
  const messages = splitMessage(htmlText);

  for (const message of messages) {
    try {
      await sendSingleMessage(message);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logger.error(`Telegram API: Invalid token or chat ID`);
      } else {
        logger.warn(`Telegram send failed. Queuing for retry...`);
        addToRetryQueue(message);
        processRetryQueue();
      }
    }
  }
}

module.exports = {
  sendMessage,
  testConnection
};
