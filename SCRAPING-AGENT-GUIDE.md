# 🤖 Autonomous Scraping Agent - Complete Guide

## Overview

The **Autonomous Scraping Agent** is an intelligent, self-managing system that continuously monitors and updates product prices across all platforms in real-time.

**Key Features:**
- ✅ Autonomous operation (runs 24/7 in background)
- ✅ Intelligent priority-based scraping
- ✅ Real-time price change detection
- ✅ Price drop notifications
- ✅ Queue-based job management
- ✅ Automatic retry with exponential backoff
- ✅ Price trend analysis
- ✅ "Best time to buy" recommendations
- ✅ Comprehensive monitoring API

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTONOMOUS SCRAPING AGENT                  │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
      ┌─────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐
      │  SCRAPING  │   │   PRICE    │   │    JOB     │
      │   QUEUE    │   │  TRACKER   │   │  MANAGER   │
      └────────────┘   └────────────┘   └────────────┘
            │                 │                 │
            │                 │                 │
      ┌─────▼──────────────────▼─────────────────▼─────┐
      │          PRODUCT DATABASE (MongoDB)            │
      └───────────────────────────────────────────────┘
```

### Architecture Components

1. **Scraping Queue**
   - Priority-based job queue
   - Concurrent processing (3 jobs at once)
   - Automatic retry on failure
   - Status tracking (queued, processing, completed, failed)

2. **Price Tracker**
   - Analyzes price changes
   - Detects significant drops (>10%)
   - Calculates price trends
   - Provides buy recommendations

3. **Job Manager**
   - Intelligently schedules scraping jobs
   - Popular products scraped more frequently
   - Handles failures gracefully
   - Maintains statistics

---

## 🚀 Getting Started

### Quick Start

The agent starts automatically when you run the server:

```bash
cd Beautynomy/server
npm start
```

You'll see:
```
🤖 Autonomous Scraping Agent started
📋 Populating scraping queue...
✅ Added 10 products to scraping queue
```

### Configuration

**Environment Variables:**

```bash
# Enable/disable the agent
ENABLE_SCRAPING_AGENT=true

# Optional: Configure ScraperAPI for better success rate
SCRAPER_API_KEY=your_api_key

# Optional: Add proxies for rotation
PROXY_LIST=proxy1.com:8080,proxy2.com:8080
```

---

## 📊 Agent Intelligence

### Priority System

The agent automatically assigns priority (1-10) to each product based on:

1. **Time Since Last Update**
   - Not updated in 1 hour → Priority 8-10 (High)
   - Not updated in 6 hours → Priority 5-7 (Medium)
   - Recently updated → Priority 3 (Low)

2. **Product Popularity**
   - Rating × log(Reviews + 1)
   - Higher popularity = Higher priority

3. **Example:**
   ```
   Product A:
   - Last updated: 2 hours ago
   - Rating: 4.5, Reviews: 100
   - Calculated Priority: 7

   Product B:
   - Last updated: 25 hours ago
   - Rating: 4.2, Reviews: 50
   - Calculated Priority: 9
   ```

### Scraping Schedule

- **High Priority Products**: Every 1 hour
- **Medium Priority Products**: Every 6 hours
- **Low Priority Products**: Every 24 hours
- **Queue Population**: Every 1 minute (checks for new products)

---

## 🔔 Price Change Notifications

### Automatic Alerts

The agent automatically creates notifications when:
- Price drops by **10% or more**
- Example:
  ```
  🔔 Price Drop Alert: Lakme Foundation
  - Amazon: -15.5% (₹500 → ₹422)
  - Nykaa: -12.3% (₹520 → ₹456)
  ```

### Accessing Notifications

**API Endpoint:**
```bash
GET /api/price-tracker/notifications?unreadOnly=true
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "notifications": [
    {
      "id": "notif_1699876543210",
      "type": "price_drop",
      "productId": "lakme-9to5-foundation",
      "productName": "Lakme 9to5 Foundation",
      "drops": [
        {
          "platform": "Amazon",
          "oldPrice": 500,
          "newPrice": 422,
          "difference": -78,
          "percentChange": -15.5,
          "type": "drop"
        }
      ],
      "createdAt": "2024-11-07T10:30:00.000Z",
      "read": false
    }
  ]
}
```

---

## 📈 Price Analytics

### 1. Price Trends

Analyze price movements over time:

```bash
GET /api/price-tracker/trends/:productId?days=30
```

**Response:**
```json
{
  "success": true,
  "trends": {
    "productId": "lakme-9to5-foundation",
    "productName": "Lakme 9to5 Foundation",
    "period": "30 days",
    "trend": "decreasing",
    "percentChange": -8.5,
    "firstPrice": 500,
    "lastPrice": 458,
    "averagePrice": 478,
    "volatility": "5.2",
    "dataPoints": 30
  }
}
```

**Trend Types:**
- `decreasing`: Price dropped by 5% or more
- `increasing`: Price increased by 5% or more
- `stable`: Price change within ±5%

### 2. Best Time to Buy

Get AI-powered purchase recommendations:

```bash
GET /api/price-tracker/best-time/:productId
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "productId": "lakme-9to5-foundation",
    "productName": "Lakme 9to5 Foundation",
    "currentPrice": 458,
    "averagePrice": 478,
    "minPrice": 450,
    "maxPrice": 520,
    "recommendation": "Excellent time to buy! Price is at historic low.",
    "confidence": "high",
    "savings": 20
  }
}
```

**Recommendations:**
- **Excellent time to buy**: Current price within 5% of historic minimum
- **Good time to buy**: Price 5% below average
- **Wait for a better deal**: Price 10% above average
- **Fair price**: Between average and minimum

---

## 🎛️ Agent Control API

### Check Agent Status

```bash
GET /api/agent/status
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "isRunning": true,
    "uptime": 7200,
    "uptimeFormatted": "2h 0m",
    "stats": {
      "startTime": "2024-11-07T08:00:00.000Z",
      "totalScraped": 156,
      "successfulScrapes": 142,
      "failedScrapes": 14,
      "priceChangesDetected": 23,
      "lastScrapedAt": "2024-11-07T10:05:00.000Z",
      "successRate": "91.03%"
    },
    "queue": {
      "queued": 8,
      "processing": 3,
      "completed": 142,
      "failed": 14,
      "concurrency": {
        "current": 3,
        "max": 3
      }
    }
  }
}
```

### Start Agent

```bash
POST /api/agent/start
Headers: x-api-key: your_admin_key
```

### Stop Agent

```bash
POST /api/agent/stop
Headers: x-api-key: your_admin_key
```

### Pause/Resume

```bash
POST /api/agent/pause
POST /api/agent/resume
Headers: x-api-key: your_admin_key
```

### Add Product to Queue

```bash
POST /api/agent/queue/add
Headers: x-api-key: your_admin_key
Content-Type: application/json

{
  "productName": "Maybelline Fit Me Foundation",
  "priority": 8
}
```

### Get Detailed Statistics

```bash
GET /api/agent/stats
Headers: x-api-key: your_admin_key
```

**Response includes:**
- Agent status and uptime
- Queue details (all jobs by status)
- Recent price notifications
- Performance metrics

---

## 🔧 Customization

### Adjust Scraping Frequency

Edit `services/scraping-agent.js`:

```javascript
const scrapingAgent = new ScrapingAgent({
  maxConcurrent: 3,              // Process 3 products at once
  pollingInterval: 60000,        // Check for new products every 1 minute
  highPriorityInterval: 3600000, // High priority: 1 hour
  lowPriorityInterval: 86400000, // Low priority: 24 hours
  batchSize: 10                  // Add 10 products per batch
});
```

### Adjust Price Drop Threshold

Edit `services/price-tracker.js`:

```javascript
class PriceTracker {
  constructor() {
    this.priceDropThreshold = 10; // Notify if price drops by 10%+
  }
}
```

---

## 📊 Monitoring Dashboard

### Real-Time Stats

**Browser Dashboard:**
Visit: `http://localhost:5000/api/agent/status`

**Key Metrics to Watch:**
1. **Success Rate**: Should be >90%
2. **Queue Size**: Should not grow indefinitely
3. **Failed Jobs**: Investigate if >10%
4. **Uptime**: Monitor for crashes
5. **Price Changes**: Track market activity

### Performance Indicators

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Success Rate | >90% | 80-90% | <80% |
| Queue Length | <20 | 20-50 | >50 |
| Avg Processing Time | <30s | 30-60s | >60s |
| Failed Jobs (%) | <5% | 5-10% | >10% |

---

## 🐛 Troubleshooting

### Issue 1: Agent Not Starting

**Check:**
```bash
# Is it enabled?
echo $ENABLE_SCRAPING_AGENT  # Should be 'true'

# Check server logs
tail -f logs/server.log
```

**Solution:**
```bash
# Set in .env
ENABLE_SCRAPING_AGENT=true

# Restart server
npm start
```

### Issue 2: Low Success Rate (<80%)

**Possible Causes:**
1. Free hosting without Puppeteer
2. Too many concurrent requests
3. Platforms blocking IP

**Solutions:**
1. Upgrade to Render Starter ($7/month)
2. Add ScraperAPI key ($49/month)
3. Reduce `maxConcurrent` to 1-2
4. Add proxy rotation

### Issue 3: Queue Growing Indefinitely

**Diagnosis:**
```bash
curl http://localhost:5000/api/agent/status
# Check queue.queued value
```

**Causes:**
- Processing too slow
- Too many products
- Scraping failures

**Solutions:**
```bash
# Increase concurrency
maxConcurrent: 5

# Clear queue
POST /api/agent/queue/clear

# Disable temporarily
POST /api/agent/pause
```

### Issue 4: No Price Changes Detected

**Check:**
1. Are products being scraped? (Check lastScrapedAt)
2. Is price tracking working? (Check notifications)
3. Are prices actually changing?

**Debug:**
```javascript
// Enable detailed logging in price-tracker.js
console.log('Price change analysis:', analysis);
```

---

## 📈 Performance Tips

### 1. Optimize for Your Traffic

**Low Traffic (<1000 daily visits):**
```javascript
maxConcurrent: 2,
highPriorityInterval: 7200000, // 2 hours
```

**Medium Traffic (1000-10000 daily):**
```javascript
maxConcurrent: 3,
highPriorityInterval: 3600000, // 1 hour
```

**High Traffic (>10000 daily):**
```javascript
maxConcurrent: 5,
highPriorityInterval: 1800000, // 30 minutes
```

### 2. Resource Management

**Memory Usage:**
- Queue keeps last 100 completed jobs
- Price tracker keeps last 100 notifications
- Auto-cleanup prevents memory leaks

**Database Load:**
- Intelligent scheduling reduces queries
- Caching prevents redundant scraping
- Batch operations optimize performance

### 3. Cost Optimization

**Free Tier Strategy:**
```javascript
// Scrape only top 50 products
batchSize: 5,
highPriorityInterval: 7200000  // 2 hours
```

**Paid Tier Strategy:**
```javascript
// Scrape all products frequently
batchSize: 20,
highPriorityInterval: 1800000  // 30 minutes
```

---

## 🔒 Security Considerations

### Authentication Required

All control endpoints require admin authentication:
```bash
Headers: x-api-key: your_admin_key
```

### Rate Limiting

Agent control endpoints are rate-limited:
- 50 requests per hour per IP

### Data Privacy

- Price data is public (no user info)
- Notifications are stored in-memory only
- No sensitive data logged

---

## 📊 Expected Results

### After 24 Hours

- **Products Scraped**: 200-500 (depending on concurrency)
- **Price Changes Detected**: 10-50
- **Success Rate**: 85-95%
- **Database Size**: +5-10 MB (price history)

### After 1 Week

- **Products Scraped**: 1,500-3,500
- **Price Changes Detected**: 100-500
- **Trend Data**: Available for most products
- **Database Size**: +50-100 MB

### After 1 Month

- **Comprehensive price history** for all products
- **Accurate trend analysis** (30-day data)
- **Reliable buy recommendations**
- **User engagement increase**: 50-100%

---

## 🎯 Use Cases

### For Users

1. **Price Drop Alerts**
   - Get notified when favorite products go on sale
   - Never miss a deal

2. **Best Time to Buy**
   - AI-powered purchase recommendations
   - Save money on every purchase

3. **Price Trends**
   - See if prices are going up or down
   - Plan purchases strategically

### For Admins

1. **Market Monitoring**
   - Track competitor pricing
   - Analyze market trends

2. **Performance Tracking**
   - Monitor scraping success rates
   - Identify problematic platforms

3. **Revenue Optimization**
   - Promote products with price drops
   - Increase conversion rates

---

## 🚀 Next Steps

1. **Monitor agent status** regularly
2. **Review notifications** daily
3. **Analyze trends** weekly
4. **Optimize settings** based on performance
5. **Scale as needed** (upgrade hosting, add proxies)

---

## 📚 API Endpoint Summary

### Agent Control
- `GET /api/agent/status` - Get status (public)
- `GET /api/agent/stats` - Detailed stats (admin)
- `POST /api/agent/start` - Start agent (admin)
- `POST /api/agent/stop` - Stop agent (admin)
- `POST /api/agent/pause` - Pause agent (admin)
- `POST /api/agent/resume` - Resume agent (admin)
- `POST /api/agent/queue/add` - Add product (admin)
- `POST /api/agent/queue/clear` - Clear queue (admin)

### Price Tracking
- `GET /api/price-tracker/notifications` - Get notifications
- `POST /api/price-tracker/notifications/:id/read` - Mark as read
- `POST /api/price-tracker/notifications/clear` - Clear all (admin)
- `GET /api/price-tracker/trends/:productId` - Get trends
- `GET /api/price-tracker/best-time/:productId` - Buy recommendation

---

**Created:** 2025-11-07
**Status:** ✅ Production Ready
**Version:** 1.0.0

**The autonomous agent is now running and will keep your prices updated 24/7!** 🤖✨
