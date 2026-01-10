const { testTelegramConnection } = require('../api/telegram/test');

async function testConnection() {
  try {
    await testTelegramConnection();
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(`Telegram token or chat ID is invalid`);
    }
    throw new Error(`Telegram API test failed: ${error.message}`);
  }
}

module.exports = {
  testConnection
};
