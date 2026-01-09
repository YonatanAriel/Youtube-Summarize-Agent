const summarySchema = {
  type: "object",
  properties: {
    english: {
      type: "object",
      properties: {
        overview: { type: "string", description: "1-2 sentence overview of the video" },
        keyPoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              timestamp: { type: "string", description: "Timestamp in MM:SS format" },
              point: { type: "string", description: "Key point description" }
            },
            required: ["timestamp", "point"]
          },
          description: "List of key points with timestamps"
        },
        takeaways: {
          type: "array",
          items: { type: "string" },
          description: "Actionable takeaways from the video"
        }
      },
      required: ["overview", "keyPoints", "takeaways"]
    },
    hebrew: {
      type: "object",
      properties: {
        overview: { type: "string", description: "סקירה של 1-2 משפטים של הווידאו" },
        keyPoints: {
          type: "array",
          items: {
            type: "object",
            properties: {
              timestamp: { type: "string", description: "Timestamp in MM:SS format" },
              point: { type: "string", description: "תיאור נקודת מפתח" }
            },
            required: ["timestamp", "point"]
          },
          description: "רשימת נקודות מפתח עם חותמות זמן"
        },
        takeaways: {
          type: "array",
          items: { type: "string" },
          description: "טיפים פעולים מהווידאו"
        }
      },
      required: ["overview", "keyPoints", "takeaways"]
    }
  },
  required: ["english", "hebrew"]
};

module.exports = {
  summarySchema
};
