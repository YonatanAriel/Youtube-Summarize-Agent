const logger = require('../logger');
const { sendSingleMessage } = require('./sendSingleMessage');

const retryQueue = [];
let isProcessingQueue = false;

async function processRetryQueue() {
  if (isProcessingQueue || retryQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (retryQueue.length > 0) {
    const message = retryQueue.shift();
    try {
      await new Promise((resolve) => setTimeout(resolve, 30000));
      await sendSingleMessage(message);
    } catch (error) {
      logger.warn(`Telegram retry failed. Will try again later.`);
      retryQueue.push(message);
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }

  isProcessingQueue = false;
}

function addToRetryQueue(message) {
  retryQueue.push(message);
}

module.exports = {
  processRetryQueue,
  addToRetryQueue
};
