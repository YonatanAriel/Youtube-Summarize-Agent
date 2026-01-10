const { sendTelegramMessage } = require('../api/telegram/send');

async function sendSingleMessage(text) {
  const response = await sendTelegramMessage(text);
  return response;
}

module.exports = {
  sendSingleMessage
};
