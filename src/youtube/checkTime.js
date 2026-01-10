const fs = require('fs');
const path = require('path');
const logger = require('../logger');

const LAST_CHECK_FILE = path.join(__dirname, '..', '..', 'data', '.last-check');

function getLastCheckTime() {
  try {
    if (fs.existsSync(LAST_CHECK_FILE)) {
      const timestamp = fs.readFileSync(LAST_CHECK_FILE, 'utf-8').trim();
      return new Date(timestamp);
    }
  } catch (error) {
    logger.debug(`Could not read last check time: ${error.message}`);
  }
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date;
}

function saveLastCheckTime() {
  try {
    fs.writeFileSync(LAST_CHECK_FILE, new Date().toISOString());
  } catch (error) {
    logger.debug(`Could not save last check time: ${error.message}`);
  }
}

module.exports = {
  getLastCheckTime,
  saveLastCheckTime
};
