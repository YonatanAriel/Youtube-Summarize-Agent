const MAX_MESSAGE_LENGTH = 4000;

function splitMessage(text) {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return [text];
  }

  const messages = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_MESSAGE_LENGTH) {
      messages.push(remaining);
      break;
    }

    let chunk = remaining.substring(0, MAX_MESSAGE_LENGTH);
    const lastNewline = chunk.lastIndexOf('\n');
    if (lastNewline > MAX_MESSAGE_LENGTH * 0.8) {
      chunk = remaining.substring(0, lastNewline);
    }

    messages.push(chunk);
    remaining = remaining.substring(chunk.length).trim();
  }

  return messages;
}

module.exports = {
  splitMessage
};
