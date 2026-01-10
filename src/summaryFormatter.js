const logger = require('./logger');
const { createTimestampLink } = require('./utils/timestamps');

function formatSummary(videoTitle, videoUrl, summary) {
  try {
    const english = summary.english;
    const hebrew = summary.hebrew;

    let englishText = `<b>📺 ${videoTitle}</b>\n\n`;
    englishText += `<b>🔗 Watch:</b> ${videoUrl}\n\n`;
    englishText += `<b>📝 Summary (English)</b>\n`;
    englishText += `${english.overview}\n\n`;
    
    englishText += `<b>🎯 Key Points:</b>\n`;
    english.keyPoints.forEach(kp => {
      const timestampLink = createTimestampLink(videoUrl, kp.timestamp);
      englishText += `<a href="${timestampLink}">[${kp.timestamp}]</a> ${kp.point}\n`;
    });
    
    englishText += `\n<b>💡 Takeaways:</b>\n`;
    english.takeaways.forEach(ta => {
      englishText += `• ${ta}\n`;
    });

    let hebrewText = `<b>📺 ${videoTitle}</b>\n\n`;
    hebrewText += `<b>🔗 Watch:</b> ${videoUrl}\n\n`;
    hebrewText += `<b>📝 סיכום (עברית)</b>\n`;
    hebrewText += `${hebrew.overview}\n\n`;
    
    hebrewText += `<b>🎯 נקודות מפתח:</b>\n`;
    hebrew.keyPoints.forEach(kp => {
      const timestampLink = createTimestampLink(videoUrl, kp.timestamp);
      hebrewText += `<a href="${timestampLink}">[${kp.timestamp}]</a> ${kp.point}\n`;
    });
    
    hebrewText += `\n<b>💡 טיפים:</b>\n`;
    hebrew.takeaways.forEach(ta => {
      hebrewText += `• ${ta}\n`;
    });

    return { english: englishText, hebrew: hebrewText };
  } catch (error) {
    logger.error(`Error formatting summary: ${error.message}`);
    throw error;
  }
}

module.exports = {
  formatSummary
};
