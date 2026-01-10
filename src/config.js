require('dotenv').config();

const requiredKeys = ['GEMINI_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  youtubeChannelId: 'UCbRP3c757lWg9M-U7TyEkXA'
};
