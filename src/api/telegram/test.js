const axios = require('axios');
const config = require('../../config');

async function testTelegramConnection() {
  const TELEGRAM_API = `${process.env.TELEGRAM_API}${config.telegramBotToken}`;
  
  const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: config.telegramChatId,
    text: '✓ YouTube Summarizer Agent is online'
  });

  return response;
}

module.exports = {
  testTelegramConnection
};
