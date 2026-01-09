const axios = require('axios');
const config = require('../../config');

async function sendTelegramMessage(text) {
  const TELEGRAM_API = `${process.env.TELEGRAM_API}${config.telegramBotToken}`;
  
  const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: config.telegramChatId,
    text: text,
    parse_mode: 'HTML'
  });

  return response.data;
}

module.exports = {
  sendTelegramMessage
};
