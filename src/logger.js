const { formatLogTimestamp } = require('./utils/timestamps');

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function log(level, message) {
  if (LOG_LEVELS[level] < currentLogLevel) {
    return;
  }

  const timestamp = formatLogTimestamp();
  const levelUpper = level.toUpperCase();
  const output = `[${timestamp}] [${levelUpper}] ${message}`;

  if (level === 'error' || level === 'warn') {
    console.error(output);
  } else {
    console.log(output);
  }
}

module.exports = {
  debug: (message) => log('debug', message),
  info: (message) => log('info', message),
  warn: (message) => log('warn', message),
  error: (message) => log('error', message)
};
