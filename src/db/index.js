const storage = require('./storage');
const queries = require('./queries');

async function init() {
  storage.loadDatabase();
}

module.exports = {
  init,
  isProcessed: queries.isProcessed,
  markProcessed: queries.markProcessed,
  getAllProcessed: queries.getAllProcessed
};
