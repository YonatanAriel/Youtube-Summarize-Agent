# YouTube Summarizer Agent

Autonomous Node.js agent that monitors YouTube channels via the Data API v3, generates structured bilingual summaries using Google Gemini 2.0 Flash with JSON schema enforcement, and delivers formatted messages to Telegram with deep-linked timestamps.

## Overview

The agent implements a serverless-first architecture optimized for GitHub Actions execution:

- **YouTube Data API v3** - Fetches videos via channel uploads playlist (bypasses RSS feed limitations)
- **Gemini 2.0 Flash** - Multimodal LLM with native YouTube video understanding and structured JSON output
- **Telegram Bot API** - HTML-formatted messages with automatic chunking for the 4096-char limit
- **JSON-based persistence** - Tracks processed videos with automatic state commits to repository

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  1. TRIGGER                                                       │
│     GitHub Actions cron fires daily at 13:00 UTC                 │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. FETCH VIDEOS                                                  │
│     Query YouTube Data API for new uploads since last check      │
│     Get video metadata (title, publish date, live status)        │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. FILTER                                                        │
│     Skip live streams and scheduled premieres                    │
│     Skip already-processed videos                                │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. SUMMARIZE                                                     │
│     Send YouTube URL to Gemini for video analysis                │
│     Receive structured bilingual summary (EN + HE)               │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. DELIVER                                                       │
│     Format summary as HTML with timestamp links                  │
│     Send to Telegram (auto-split if > 4000 chars)                │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. PERSIST                                                       │
│     Mark video as processed in JSON database                     │
│     Commit state changes back to repository                      │
└──────────────────────────────────────────────────────────────────┘
```

## Gemini Integration

The agent uses Gemini's native video understanding capability - no transcript extraction required. Videos are passed directly via `file_data.file_uri`:

```javascript
{
  contents: [{
    parts: [
      { text: summaryPrompt },
      { file_data: { file_uri: youtubeUrl } }
    ]
  }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: summarySchema
  }
}
```

**Response Schema** (enforced by Gemini):
```javascript
{
  english: {
    overview: string,           // 1-2 sentence summary
    keyPoints: [{
      timestamp: string,        // MM:SS format
      point: string
    }],
    takeaways: string[]         // Actionable items
  },
  hebrew: { /* identical structure */ }
}
```

**Retry Strategy:**
- 401/403: Immediate failure (invalid credentials)
- 429: 60-second wait, up to 3 retries
- Transient errors: Exponential backoff (1s, 2s, 4s)
- Timeout: 120 seconds per request

## YouTube Data API Integration

Uses the playlist-based approach for reliable video fetching:

1. `GET /channels` - Retrieve `contentDetails.relatedPlaylists.uploads` playlist ID
2. `GET /playlistItems` - Fetch videos from uploads playlist, filtered by `publishedAfter`
3. `GET /videos` - Get `liveStreamingDetails` and `status` for filtering

**Video Filtering Logic:**
```javascript
// Skip scheduled premieres
if (liveDetails?.scheduledStartTime > now) return false;

// Skip active live streams
if (liveDetails?.actualStartTime && !liveDetails?.actualEndTime) return false;
```

## Telegram Message Handling

**Chunking Algorithm:**
- Max chunk size: 4000 characters (buffer for HTML tags)
- Split preference: Last newline at 80%+ of chunk
- Fallback: Hard split at 4000 chars

**Retry Queue:**
- Failed messages queued in-memory
- 30-second delay between retry attempts
- Persistent retry until success

**Output Format:**
```html
<b>Video Title</b>

<b>Watch:</b> https://youtube.com/watch?v=...

<b>Summary (English)</b>
Overview text...

<b>Key Points:</b>
<a href="https://youtube.com/watch?v=...&t=150s">[02:30]</a> Point description
<a href="https://youtube.com/watch?v=...&t=420s">[07:00]</a> Another point

<b>Takeaways:</b>
• Actionable item 1
• Actionable item 2
```

## Setup

### Prerequisites

- Node.js 18+
- GitHub repository (for Actions deployment)

### Environment Variables

```env
# Required
GEMINI_API_KEY=                 # Google AI Studio API key
GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
TELEGRAM_BOT_TOKEN=             # From @BotFather
TELEGRAM_CHAT_ID=               # Target chat/channel ID
TELEGRAM_API=https://api.telegram.org/bot
YOUTUBE_API_KEY=                # Google Cloud Console (YouTube Data API v3)

# Optional
LOG_LEVEL=info                  # debug | info | warn | error
DEBUG=false                     # Verbose API logging
```

### GitHub Actions Deployment

1. Add secrets to repository (Settings > Secrets > Actions):
   - `GEMINI_API_KEY`
   - `GEMINI_ENDPOINT`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TELEGRAM_API`
   - `YOUTUBE_API_KEY`

2. Workflows are pre-configured:
   - `youtube-summarizer.yml` - Daily at 13:00 UTC
   - `youtube-summarizer-test.yml` - Manual trigger (processes latest video)

3. State persistence: Workflow auto-commits `data/` changes after each run

### Local Testing

```bash
npm install
cp .env.example .env
# Configure .env with API keys
npm start -- --test    # Process single video for testing
```

## Project Structure

```
src/
├── agent.js                    # Entry point (cron-based scheduling)
├── agent-github-actions.js     # GitHub Actions entry (single execution)
├── agent-github-actions-test.js # Test mode (process latest video)
├── config.js                   # Environment validation
├── logger.js                   # Leveled logging (debug/info/warn/error)
├── rssMonitor.js               # Video fetch orchestration
├── summaryFormatter.js         # HTML output generation
│
├── api/
│   ├── gemini/
│   │   ├── summarize.js        # Gemini API call with schema
│   │   └── test.js             # Connection validation
│   ├── telegram/
│   │   ├── send.js             # sendMessage API call
│   │   └── test.js             # getMe validation
│   └── youtube/
│       ├── search.js           # Channel/playlist fetching
│       └── details.js          # Video metadata (live status)
│
├── gemini/
│   ├── client.js               # Retry logic, error handling
│   ├── prompts.js              # Summarization prompt
│   └── schema.js               # JSON response schema
│
├── telegram/
│   ├── client.js               # High-level send interface
│   ├── sendSingleMessage.js    # Single message dispatch
│   ├── splitMessage.js         # Chunking algorithm
│   ├── retryQueue.js           # Failed message queue
│   └── testConnection.js       # Connection validation
│
├── youtube/
│   ├── fetcher.js              # Video object mapping
│   ├── videoFilter.js          # Live/premiere filtering
│   └── checkTime.js            # Last-check timestamp I/O
│
├── video/
│   └── processor.js            # Per-video pipeline orchestration
│
├── db/
│   ├── index.js                # Database interface
│   ├── storage.js              # JSON file I/O
│   └── queries.js              # isProcessed, markProcessed
│
├── test/
│   └── testMode.js             # Single-video test execution
│
└── utils/
    └── timestamps.js           # Timestamp parsing/formatting

data/
├── processed.json              # Processed video records
└── .last-check                 # Last check ISO timestamp

.github/workflows/
├── youtube-summarizer.yml      # Production (daily cron)
└── youtube-summarizer-test.yml # Manual test trigger
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run agent with node-cron (local) |
| `npm run github-actions` | Single execution for CI |
| `npm run github-actions-test` | Process latest video (ignores state) |
| `npm test` | Run Jest test suite |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.6.2 | HTTP client |
| dotenv | ^16.3.1 | Environment loading |
| node-cron | - | Local scheduling |
| xml2js | ^0.6.2 | XML parsing (legacy) |
| jest | ^29.7.0 | Testing |
| fast-check | ^3.14.0 | Property-based testing |

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing env vars | Exit with code 1, clear error message |
| YouTube API 403 | Retry 3x with 2s delay |
| Gemini 429 | Wait 60s, retry up to 3x |
| Gemini timeout | Fail after 120s |
| Telegram 401/403 | Log error, continue processing |
| Telegram network error | Queue for retry (30s intervals) |

## License

MIT
