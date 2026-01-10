const axios = require('axios');
const config = require('../../config');

async function testTelegramConnection() {
  const TELEGRAM_API = `${process.env.TELEGRAM_API}${config.telegramBotToken}`;
  
  const response = await axios.get(`${TELEGRAM_API}/getMe`);

  return response;
}

module.exports = {
  testTelegramConnection
};
