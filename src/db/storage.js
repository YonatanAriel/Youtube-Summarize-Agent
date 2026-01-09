const fs = require('fs');
const path = require('path');
const logger = require('../logger');

const dbPath = path.join(__dirname, '..', '..', 'data', 'processed.json');

let processedVideos = [];

function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(processedVideos, null, 2), 'utf-8');
  } catch (error) {
    logger.error(`Failed to save database: ${error.message}`);
  }
}

function loadDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      processedVideos = JSON.parse(data);
    } else {
      processedVideos = [];
      saveDatabase();
    }
  } catch (error) {
    logger.error(`Database load failed: ${error.message}`);
    processedVideos = [];
  }
}

module.exports = {
  saveDatabase,
  loadDatabase,
  getProcessedVideos: () => processedVideos,
  setProcessedVideos: (videos) => { processedVideos = videos; }
};
