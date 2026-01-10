// Only load .env file if it exists (for local development)
// In GitHub Actions, environment variables are passed directly
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or .env file doesn't exist
  }
}

const requiredKeys = ['GEMINI_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];

// Debug logging
if (process.env.DEBUG === 'true') {
  console.log('[CONFIG] DEBUG mode enabled');
  console.log('[CONFIG] Checking required environment variables...');
  requiredKeys.forEach(key => {
    const isSet = !!process.env[key];
    console.log(`[CONFIG] ${key}: ${isSet ? 'SET' : 'NOT SET'}`);
  });
}

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
