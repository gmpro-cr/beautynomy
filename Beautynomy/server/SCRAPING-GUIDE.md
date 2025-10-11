# Real-Time Price Scraping System

## Overview

Beautynomy now includes a real-time price scraping system that fetches live product data from major Indian e-commerce platforms:
- Nykaa
- Amazon India
- Flipkart

## Features

### 1. Web Scrapers
Located in `/scrapers/` directory:
- `nykaa.js` - Scrapes Nykaa.com
- `amazon.js` - Scrapes Amazon India
- `flipkart.js` - Scrapes Flipkart
- `index.js` - Orchestrates all scrapers

### 2. Scraper Service
Located at `/services/scraper-service.js`:
- `scrapeAndUpdateProduct(productName)` - Scrape a single product
- `batchScrapeProducts(productNames[])` - Scrape multiple products

Features:
- Groups similar products from different platforms
- Updates or creates products in MongoDB
- Tracks price changes
- Extracts ratings, images, and product URLs

### 3. Automated Scheduler
Located at `/scheduler/price-updater.js`:

**Scheduled Jobs:**
- **Daily Full Update**: Runs at 3:00 AM every day
- **High-Priority Update**: Runs every 6 hours for top products
- **Manual Trigger**: Available via API endpoint

### 4. Price History Tracking
The Product schema now includes `priceHistory[]` to track price changes over time:
```javascript
priceHistory: [{
  date: Date,
  prices: [{platform, amount}],
  lowestPrice: Number,
  averagePrice: Number
}]
```

Keeps last 90 days of price history automatically.

## API Endpoints

### POST /api/scrape
Scrape a single product from all platforms.

**Request:**
```json
{
  "productName": "Lakme Lipstick"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Found and updated 1 products",
  "products": [...],
  "scrapedCount": 3
}
```

### POST /api/scrape/batch
Scrape multiple products (max 20).

**Request:**
```json
{
  "productNames": ["Product 1", "Product 2", "Product 3"]
}
```

**Response:**
```json
{
  "success": true,
  "total": 3,
  "successful": 2,
  "failed": 1,
  "results": [...]
}
```

### POST /api/update-prices
Manually trigger price updates for all or specific products.

**Request (all products):**
```json
{}
```

**Request (specific products):**
```json
{
  "productIds": ["product-id-1", "product-id-2"]
}
```

**Response:**
```json
{
  "success": true,
  "successCount": 150,
  "failCount": 4,
  "total": 154
}
```

## How It Works

### 1. Web Scraping Process
1. User sends search query (e.g., "Lakme Lipstick")
2. System searches all 3 platforms in parallel
3. Extracts product data (name, price, rating, image, URL)
4. Groups similar products together
5. Updates MongoDB with new data

### 2. Data Extraction
For each product found:
- **Name**: Product title
- **Price**: Current selling price (in INR)
- **Platform**: Nykaa, Amazon, or Flipkart
- **URL**: Direct product link (real product page)
- **Image**: Product image URL
- **Rating**: Product rating (1-5 stars)

### 3. Product Matching
Products with similar names from different platforms are grouped together:
- Normalizes product names
- Uses 70% similarity threshold
- Creates single product entry with multiple price sources

### 4. Price Change Detection
- Compares new prices with previous prices
- Calculates percentage change
- Updates `priceChange` field in database
- Adds entry to `priceHistory` array

## Important Notes

### Anti-Scraping Measures
E-commerce websites have anti-scraping protection:
- Rate limiting
- IP blocking
- CAPTCHA challenges
- Dynamic CSS class names
- JavaScript-rendered content

**Our Solutions:**
- User-Agent headers to mimic browsers
- Timeouts and retries
- Batch processing with delays
- Respectful scraping (2-3 second delays between requests)
- Scheduled updates during off-peak hours (3 AM)

### CSS Selectors
Websites frequently change their HTML structure. If scrapers stop working:

1. Check `/scrapers/nykaa.js` line 19-25
2. Check `/scrapers/amazon.js` line 20-27
3. Check `/scrapers/flipkart.js` line 20-28

Update CSS selectors based on current website structure.

### Legal Considerations
- Web scraping for price comparison is legal in India
- We're using publicly available data
- Respectful scraping practices (rate limiting)
- No circumventing authentication or paywalls
- Compliance with robots.txt (where applicable)

### Performance
- Scraping 1 product: ~5-10 seconds
- Scraping 20 products (batch): ~2-3 minutes
- Full database update (204 products): ~30-45 minutes

### Error Handling
Scrapers gracefully handle:
- Network timeouts
- Invalid responses
- Missing data fields
- Platform unavailability

Failed scrapes return empty arrays and log errors without crashing the server.

## Testing the System

### Test Single Product Scraping
```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"productName": "Lakme Lipstick"}'
```

### Test Batch Scraping
```bash
curl -X POST http://localhost:8000/api/scrape/batch \
  -H "Content-Type: application/json" \
  -d '{"productNames": ["Lakme Lipstick", "Nykaa Foundation", "Maybelline Mascara"]}'
```

### Trigger Manual Price Update
```bash
curl -X POST http://localhost:8000/api/update-prices \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Database Changes

### New Fields in Product Schema
- `priceHistory[]` - Array of historical price data
  - `date` - Timestamp of price snapshot
  - `prices[]` - Prices from each platform
  - `lowestPrice` - Lowest price among all platforms
  - `averagePrice` - Average price across platforms

### Migration
Existing products will automatically get `priceHistory` array when first updated by the scraper.

## Configuration

### Environment Variables
```env
PORT=8000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

### Scheduler Settings
Edit `/scheduler/price-updater.js`:
- Line 10: Change daily update time
- Line 17: Change high-priority update frequency
- Line 29: Change full update batch size
- Line 69: Change high-priority product limit

## Monitoring

Check server logs for:
- `🔍 Scraping prices for:` - Scraping started
- `✅ Nykaa: Found X products` - Scraping results
- `✅ Updated product:` - Product updated in DB
- `✅ Created new product:` - New product added
- `❌ Failed:` - Scraping errors

## Troubleshooting

### No Products Found
**Symptoms:** `Found 0 products` from all platforms

**Causes:**
1. CSS selectors outdated
2. Website blocking requests
3. Network issues
4. Search query too specific

**Solutions:**
1. Update CSS selectors in scraper files
2. Add more diverse User-Agent headers
3. Increase timeout values
4. Use broader search terms

### Products Not Grouping
**Symptoms:** Same product appears multiple times

**Solution:** Adjust similarity threshold in `/services/scraper-service.js` line 100

### Price History Not Saving
**Symptoms:** `priceHistory` array empty

**Solution:** Ensure scraper service is being used (not direct Product.update)

### Scheduler Not Running
**Symptoms:** No automatic updates at 3 AM

**Solution:**
1. Check server logs for "📅 Price update scheduler initialized"
2. Verify server is running continuously
3. Check system time/timezone

## Future Improvements

### Planned Enhancements
1. **Puppeteer Integration**: For JavaScript-heavy sites
2. **Proxy Rotation**: To avoid IP blocking
3. **ML-Based Categorization**: Auto-detect product categories
4. **Brand Recognition**: Extract brands from product names
5. **Price Drop Alerts**: Notify users of price decreases
6. **Chart API**: Visualize price history
7. **Purplle & Myntra**: Add remaining platform scrapers

### Advanced Features
- Search history tracking
- Popular product detection
- Smart update scheduling (update popular products more frequently)
- Cached results for repeated searches
- API rate limiting per user

## Support

For issues or questions:
1. Check server logs first
2. Test scrapers individually
3. Verify MongoDB connection
4. Check API endpoint responses
5. Review SCRAPING-GUIDE.md (this file)

## License & Ethics

This scraping system:
- Uses publicly available data only
- Implements respectful rate limiting
- Does not circumvent security measures
- Complies with Indian legal framework
- Provides value to consumers through price comparison

Always review and comply with each platform's Terms of Service.
