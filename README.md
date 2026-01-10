# YouTube Summarizer Agent

A production-grade, fully autonomous Node.js agent that monitors YouTube channels for new content, automatically generates AI-powered summaries using Google Gemini, and delivers them to Telegram. Designed for 24/7 operation with zero manual intervention after initial setup.

## Overview

This agent implements a complete content automation pipeline:

1. **Continuous Monitoring** - Polls YouTube RSS feeds at configurable intervals
2. **Intelligent Filtering** - Excludes live streams, premieres, and scheduled videos
3. **AI Summarization** - Generates bilingual summaries (English + Hebrew) with timestamped key points
4. **Reliable Delivery** - Posts to Telegram with automatic retry queuing for failed messages
5. **Persistent State** - Tracks processed videos to prevent duplicate summarization
6. **Graceful Error Handling** - Implements exponential backoff, rate limit handling, and connection resilience

## Key Features

- **Multi-Channel Support** - Monitor any YouTube channel by configuring the channel ID
- **AI-Powered Summaries** - Uses Google Gemini to generate structured summaries with key points and takeaways
- **Telegram Integration** - Delivers formatted summaries with clickable timestamp links
- **Persistent Database** - JSON-based storage tracks all processed videos across restarts
- **Automatic Retry Logic** - Failed Telegram sends are queued and retried with exponential backoff
- **Structured Logging** - Timestamped logs with debug, info, warn, and error levels
- **Rate Limit Aware** - Handles Gemini API rate limits gracefully with automatic backoff
- **Startup Validation** - Verifies all API credentials before starting the monitoring loop
- **Cost Efficient** - Minimal API usage (~$0.01/month with Gemini's free tier)

## Architecture

### Core Components

**Agent Orchestration** (`src/agent.js`)
- Startup validation and initialization
- Cron-based scheduling (daily at 00:07 UTC)
- Graceful shutdown handling

**RSS Monitoring** (`src/rssMonitor.js`)
- Fetches YouTube RSS feeds with retry logic (3 attempts)
- Tracks last check timestamp to identify new videos
- Filters out live streams and scheduled content

**Video Processing** (`src/video/processor.js`)
- Orchestrates the summarization pipeline
- Handles errors per-video without stopping the agent

**Gemini Integration** (`src/gemini/client.js`)
- Structured output with JSON schema validation
- Rate limit handling with 60-second backoff
- Exponential backoff for transient errors
- Bilingual summary generation

**Telegram Delivery** (`src/telegram/client.js`)
- Message splitting for Telegram's 4096-character limit
- Retry queue for failed sends
- HTML formatting with clickable timestamp links

**Data Persistence** (`src/db/`)
- JSON-based storage for processed videos
- Timestamp tracking for incremental checks
- Query interface for video lookup

## Quick Start

### Prerequisites

- Node.js 14+ 
- Three API keys (see below)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the template and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_gemini_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 3. Obtain API Keys

**Google Gemini API Key:**
- Visit https://ai.google.dev/aistudio
- Click "Get API key"
- Copy to `.env`

**Telegram Bot Token:**
- Open Telegram, search for @BotFather
- Send `/newbot` and follow prompts
- Copy token to `.env`

**Telegram Chat ID:**
- Search for @userinfobot in Telegram
- Send `/start` to get your ID
- Copy to `.env`

### 4. Start the Agent

```bash
npm start
```

Expected output:
```
[2025-01-09 19:00:00] [info] Agent starting...
[2025-01-09 19:00:01] [info] Gemini API connection verified
[2025-01-09 19:00:02] [info] Telegram connection verified
[2025-01-09 19:00:03] [info] Agent ready. Monitoring for new videos...
```

## Running 24/7

### Using GitHub Actions (Recommended - 100% Free)

Deploy to GitHub Actions for completely free, automated scheduling with zero maintenance.

**Setup (5 minutes):**

1. **Make your repo public** (if not already)
   - GitHub repo → Settings → Change repository visibility → Public

2. **Add GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret" and add:
     - `GEMINI_API_KEY` - Your Gemini API key
     - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
     - `TELEGRAM_CHAT_ID` - Your Telegram chat ID

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow"
   git push
   ```

4. **Verify workflow**
   - Go to GitHub repo → Actions
   - You should see "YouTube Summarizer Agent" workflow
   - Click "Run workflow" to test manually

**How it works:**
- Runs automatically every day at 00:07 UTC
- Processes all new videos
- Commits updated database to repo
- Logs available in GitHub UI
- Completely free (public repo)

**Monitor runs:**
- GitHub repo → Actions → YouTube Summarizer Agent
- Click any run to see detailed logs
- Check "Run workflow" history

**Adjust schedule:**
- Edit `.github/workflows/youtube-summarizer.yml`
- Change cron expression (line with `cron:`)
- Commit and push

### Using PM2 (Local Machine)

Install PM2 globally:
```bash
npm install -g pm2
```

Start the agent:
```bash
pm2 start src/agent.js --name youtube-agent
```

Enable auto-restart on system reboot:
```bash
pm2 startup
pm2 save
```

### Useful PM2 Commands

```bash
pm2 status                    # View agent status
pm2 logs youtube-agent        # View live logs
pm2 stop youtube-agent        # Stop the agent
pm2 restart youtube-agent     # Restart the agent
pm2 delete youtube-agent      # Remove from PM2
```

## Cloud Deployment (Alternative)

**Important:** PM2 only works when your machine is running. If you need 24/7 operation regardless of your laptop's state, deploy to the cloud.

### Recommended Cloud Platforms

**Railway** (Modern, affordable)
- Pay-as-you-go pricing ($5-10/month)
- Simple deployment from GitHub
- Good for Node.js apps

**AWS EC2** (Most control)
- Micro instance eligible for free tier
- Full control over environment
- More complex setup

**DigitalOcean** (Simple, affordable)
- Droplets starting at $4/month
- Simple deployment
- Good documentation

### Basic Railway Deployment

1. Create a Railway account at https://railway.app
2. Connect your GitHub repo
3. Railway auto-detects Node.js
4. Deploy with one click
5. Agent runs 24/7 on Railway's servers

## Configuration

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

# Optional
LOG_LEVEL=info                # debug, info, warn, error
CHECK_INTERVAL_SECONDS=300    # Polling interval (default: 5 minutes)
```

### Monitoring Schedule

The agent runs on a daily cron schedule (00:07 UTC). Modify the cron expression in `src/agent.js`:

```javascript
const cronExpression = `07 00 * * *`;  // Daily at 00:07 UTC
```

## Project Structure

```
src/
├── agent.js                      # Main orchestration loop
├── config.js                     # Configuration loader
├── logger.js                     # Structured logging
├── rssMonitor.js                 # YouTube RSS feed monitoring
├── summaryFormatter.js           # HTML formatting for Telegram
├── api/
│   ├── gemini/
│   │   ├── summarize.js          # Gemini API calls
│   │   └── test.js               # Connection validation
│   ├── telegram/
│   │   ├── send.js               # Telegram API calls
│   │   └── test.js               # Connection validation
│   └── youtube/
│       ├── search.js             # YouTube search API
│       └── details.js            # Video details API
├── gemini/
│   ├── client.js                 # Gemini client wrapper
│   ├── prompts.js                # Summarization prompts
│   └── schema.js                 # Response schema validation
├── telegram/
│   ├── client.js                 # Telegram client wrapper
│   ├── sendSingleMessage.js      # Single message sender
│   ├── splitMessage.js           # Message splitting logic
│   ├── retryQueue.js             # Failed message retry queue
│   └── testConnection.js         # Connection test
├── youtube/
│   ├── fetcher.js                # Video fetching logic
│   ├── videoFilter.js            # Filter live/scheduled videos
│   └── checkTime.js              # Timestamp tracking
├── video/
│   └── processor.js              # Per-video processing pipeline
├── db/
│   ├── index.js                  # Database interface
│   ├── storage.js                # JSON storage layer
│   └── queries.js                # Query functions
├── test/
│   └── testMode.js               # Single-video test mode
└── utils/
    └── timestamps.js             # Timestamp utilities

data/
├── processed.json                # Processed videos database
└── .last-check                   # Last check timestamp
```

## How It Works

### Startup Phase

1. Load and validate environment configuration
2. Test Gemini API connection
3. Test Telegram connection
4. Load previously processed videos from database
5. Check for any new videos since last run
6. Schedule recurring monitoring job

### Monitoring Loop

Triggered daily at 00:07 UTC:

1. **Fetch** - Query YouTube RSS feed for videos published since last check
2. **Filter** - Exclude live streams, premieres, and scheduled content
3. **Process** - For each new video:
   - Send to Gemini for summarization
   - Generate bilingual summary with key points
   - Format as HTML with timestamp links
   - Send to Telegram
   - Mark as processed in database
4. **Handle Errors** - Retry failed Telegram sends, log issues

### Error Handling Strategy

- **YouTube API Failures** - Retry up to 3 times with 2-second delays
- **Gemini Rate Limits** - Wait 60 seconds and retry (up to 3 attempts)
- **Gemini Transient Errors** - Exponential backoff (1s, 2s, 4s)
- **Telegram Send Failures** - Queue for retry with exponential backoff
- **Invalid Credentials** - Fail fast with clear error message

## Logging

The agent provides structured, timestamped logging:

```
[2025-01-09 19:05:35] [info] Checking RSS feed...
[2025-01-09 19:05:37] [info] NEW VIDEO: "Building with AI"
[2025-01-09 19:05:38] [info] Summarizing with Gemini...
[2025-01-09 19:05:58] [info] Got summary (1,245 tokens)
[2025-01-09 19:05:59] [info] Sending to Telegram...
[2025-01-09 19:06:00] [info] Sent to Telegram
```

Redirect logs to a file:
```bash
npm start > agent.log 2>&1
```

## Troubleshooting

### Agent Exits Immediately

**Cause:** Missing or invalid API keys

**Solution:**
- Verify all three keys are in `.env`
- Test keys individually using the test endpoints
- Check for typos or extra whitespace

### No Videos Being Summarized

**Cause:** Incorrect channel ID or no new videos

**Solution:**
- Verify the YouTube channel ID in `src/config.js`
- Check logs: `pm2 logs youtube-agent`
- Ensure Telegram chat ID is correct
- Verify you've sent at least one message to your bot

### Rate Limit Errors

**Cause:** Gemini API rate limits exceeded

**Solution:**
- Agent automatically waits 60 seconds and retries
- Reduce monitoring frequency if errors persist
- Consider upgrading Gemini API tier

### Telegram Send Failures

**Cause:** Invalid token or chat ID

**Solution:**
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`
- Test connection: `npm start -- --test`
- Ensure bot has permission to send messages

## Testing

Run the test suite:

```bash
npm test
```

Test a single video in isolation:

```bash
npm start -- --test
```

## Performance Characteristics

- **Memory Usage** - ~50MB baseline (minimal database overhead)
- **CPU Usage** - Negligible (mostly idle between checks)
- **Network** - ~2-3 API calls per video (YouTube search, details, Gemini)
- **Cost** - ~$0.001-0.01 per video with Gemini free tier
- **Latency** - 20-30 seconds per video (Gemini processing time)

## Dependencies

- **axios** - HTTP client for API calls
- **dotenv** - Environment configuration
- **node-cron** - Scheduling
- **xml2js** - RSS feed parsing
- **jest** - Testing framework
- **fast-check** - Property-based testing

## License

MIT - See LICENSE file for details

This project is open source and free to use, modify, and distribute. You can use it for personal or commercial projects without restriction.
