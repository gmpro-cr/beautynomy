# Platform API Integration via Cuelinks

## Overview

This document describes the new **Platform API Integration** that uses **Cuelinks API** to fetch products from major e-commerce platforms including Nykaa, Amazon, Flipkart, Myntra, Purplle, Tira, and Sephora.

This is a **better alternative to web scraping** because:
- ✅ Official API access through Cuelinks
- ✅ Automatic affiliate tracking built-in
- ✅ More reliable and faster
- ✅ No risk of breaking due to website changes
- ✅ Real-time product offers and deals
- ✅ Better data quality with ratings, images, descriptions

## What Was Implemented

### 1. New Service: `platform-api-service.js`

Location: `/server/services/platform-api-service.js`

**Features:**
- Fetch products from all supported platforms via Cuelinks API
- Fetch from specific platforms (nykaa, amazon, flipkart, myntra, purplle, tira, sephora)
- Automatic affiliate link generation with Cuelinks tracking
- Smart product grouping across platforms
- Database integration (saves products to MongoDB)
- Brand extraction and categorization

### 2. Bug Fix: `scraper-service.js`

**Issue Fixed:** `productId` was being used before it was defined (line 123)
**Solution:** Moved `productId` creation to line 114 (before it's used)

This critical fix ensures Cuelinks URL conversion works correctly during scraping.

### 3. New API Endpoints

#### a) Fetch from All Platforms
```
GET /api/platforms/fetch?query=<product_name>&limit=<number>
```

**Example:**
```bash
curl "https://beautynomy-api.onrender.com/api/platforms/fetch?query=lakme%20lipstick&limit=30"
```

**Response:**
```json
{
  "success": true,
  "message": "Found 25 products from 5 platforms",
  "products": [...],
  "platformCount": 5
}
```

#### b) Fetch from Specific Platform
```
GET /api/platforms/:platform/fetch?query=<product_name>
```

**Supported Platforms:** `nykaa`, `amazon`, `flipkart`, `myntra`, `purplle`, `tira`, `sephora`

**Example:**
```bash
curl "https://beautynomy-api.onrender.com/api/platforms/nykaa/fetch?query=foundation"
```

**Response:**
```json
{
  "success": true,
  "platform": "nykaa",
  "query": "foundation",
  "count": 15,
  "offers": [...]
}
```

#### c) Platform API Stats
```
GET /api/platforms/stats
```

**Example:**
```bash
curl "https://beautynomy-api.onrender.com/api/platforms/stats"
```

**Response:**
```json
{
  "message": "Platform API statistics",
  "configured": true,
  "supportedPlatforms": ["nykaa", "amazon", "flipkart", "myntra", "purplle", "tira", "sephora"],
  "platformCount": 7
}
```

#### d) Hybrid Fetch (API + Scraping Fallback)
```
POST /api/products/fetch-hybrid
Content-Type: application/json

{
  "productName": "maybelline lipstick",
  "useAPI": true,
  "useScraping": false
}
```

**Example:**
```bash
curl -X POST "https://beautynomy-api.onrender.com/api/products/fetch-hybrid" \
  -H "Content-Type: application/json" \
  -d '{"productName": "maybelline lipstick", "useAPI": true, "useScraping": false}'
```

**Response:**
```json
{
  "success": true,
  "products": [...],
  "source": "cuelinks_api",
  "platformCount": 4,
  "message": "Found 12 products from 4 platforms"
}
```

**If API fails, it can fallback to scraping:**
```json
{
  "productName": "maybelline lipstick",
  "useAPI": true,
  "useScraping": true  // Enable scraping fallback
}
```

## How It Works

### Architecture

```
User Request
    ↓
API Endpoint (/api/platforms/fetch)
    ↓
Platform API Service
    ↓
Cuelinks Product Fetcher
    ↓
Cuelinks API (https://www.cuelinks.com/api)
    ↓
Returns Products with Affiliate Links
    ↓
Group Similar Products
    ↓
Save to MongoDB
    ↓
Return to User
```

### Merchant Mappings

The service intelligently maps platform names to Cuelinks merchant names:

```javascript
{
  nykaa: ['Nykaa', 'NYKAA', 'nykaa'],
  amazon: ['Amazon', 'Amazon.in', 'Amazon India', 'AMAZON'],
  flipkart: ['Flipkart', 'FLIPKART', 'flipkart'],
  myntra: ['Myntra', 'MYNTRA', 'myntra'],
  purplle: ['Purplle', 'PURPLLE', 'purplle'],
  tira: ['Tira', 'TIRA', 'tira', 'Tira Beauty'],
  sephora: ['Sephora', 'SEPHORA', 'sephora', 'Sephora India']
}
```

### Product Grouping

The service groups similar products across platforms:

1. Normalizes product names (removes special characters, lowercase)
2. Checks if 70% of shorter name is contained in longer name
3. Groups matching products together
4. Creates single product entry with multiple prices

### Affiliate Tracking

All product URLs are automatically converted to Cuelinks deeplinks:

**Original URL:**
```
https://www.nykaa.com/maybelline-lipstick/p/12345
```

**Cuelinks Deeplink:**
```
https://linksredirect.com/?pub_id=217482&url=https%3A%2F%2Fwww.nykaa.com%2Fmaybelline-lipstick%2Fp%2F12345&subId=Nykaa-maybelline-superstay-matte-ink
```

**SubID Format:** `{Platform}-{ProductID}`
Example: `Nykaa-maybelline-superstay-matte-ink`

This allows you to track conversions by:
- Platform (which e-commerce site)
- Product (which specific product)

## Configuration

### Required Environment Variables

```bash
# Cuelinks API Credentials
CUELINKS_API_KEY=your_api_key_here
CUELINKS_PUBLISHER_ID=217482

# MongoDB (already configured)
MONGODB_URI=mongodb+srv://...
```

### Check Configuration

```bash
curl "https://beautynomy-api.onrender.com/api/cuelinks/status"
```

Should return:
```json
{
  "message": "Cuelinks service status",
  "configured": true,
  "apiKey": "***...Y4dhkuToMrUW0Ut0-DNwZroQPK7w",
  "publisherId": "217482"
}
```

## Usage Examples

### 1. Fetch Beauty Products

```bash
# Get foundation products from all platforms
curl "https://beautynomy-api.onrender.com/api/platforms/fetch?query=foundation&limit=50"

# Get lipstick from Nykaa only
curl "https://beautynomy-api.onrender.com/api/platforms/nykaa/fetch?query=lipstick"

# Get serum products from Amazon
curl "https://beautynomy-api.onrender.com/api/platforms/amazon/fetch?query=vitamin%20c%20serum"
```

### 2. Check Supported Platforms

```bash
curl "https://beautynomy-api.onrender.com/api/platforms/stats"
```

### 3. Hybrid Fetch with Fallback

```javascript
// Try API first, fallback to scraping if needed
fetch('https://beautynomy-api.onrender.com/api/products/fetch-hybrid', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productName: 'lakme 9 to 5 lipstick',
    useAPI: true,
    useScraping: true  // Enable fallback
  })
})
.then(res => res.json())
.then(data => {
  console.log(`Source: ${data.source}`); // 'cuelinks_api' or 'scraping'
  console.log(`Products: ${data.products.length}`);
});
```

## Advantages Over Scraping

| Feature | Web Scraping | Cuelinks API |
|---------|-------------|--------------|
| **Reliability** | ❌ Breaks when websites change | ✅ Stable API |
| **Speed** | ❌ Slow (needs page loading) | ✅ Fast (direct API) |
| **Data Quality** | ⚠️ Depends on scraping accuracy | ✅ Official data |
| **Affiliate Links** | ⚠️ Manual conversion needed | ✅ Automatic |
| **Legal** | ⚠️ Gray area | ✅ Official partnership |
| **Maintenance** | ❌ High (frequent updates) | ✅ Low (API stable) |
| **Rate Limiting** | ⚠️ Risk of IP blocks | ✅ Managed by Cuelinks |

## Testing

### Local Testing

```bash
# Start server
cd server
npm start

# Test API fetch
curl "http://localhost:5000/api/platforms/fetch?query=lipstick"

# Test specific platform
curl "http://localhost:5000/api/platforms/nykaa/fetch?query=foundation"

# Test stats
curl "http://localhost:5000/api/platforms/stats"
```

### Production Testing

```bash
# Test on Render
curl "https://beautynomy-api.onrender.com/api/platforms/fetch?query=serum&limit=20"
```

## Monitoring

### Track Conversions in Cuelinks Dashboard

1. Go to https://www.cuelinks.com/publisher/dashboard
2. Login with Publisher ID: 217482
3. View conversions by SubID to see:
   - Which platforms are performing best
   - Which products generate most sales
   - Conversion rates by product

### API Logs

The server logs all API calls:

```
🔍 API fetch request for: lakme lipstick
📡 Trying Cuelinks API...
✅ Found 15 beauty product offers
✅ Updated product: Lakme 9 to 5 Primer + Matte Lip Color
✅ Found 12 products via Cuelinks API
```

## Troubleshooting

### Issue: "Cuelinks not configured"

**Solution:** Check environment variables
```bash
echo $CUELINKS_API_KEY
echo $CUELINKS_PUBLISHER_ID
```

Add to `.env` if missing:
```
CUELINKS_API_KEY=r1QSVw_7PJghKr-Y4dhkuToMrUW0Ut0-DNwZroQPK7w
CUELINKS_PUBLISHER_ID=217482
```

### Issue: No products found

**Possible causes:**
1. API key invalid or expired
2. Product not available on Cuelinks merchants
3. Search term too specific

**Solutions:**
- Try broader search terms
- Check Cuelinks dashboard for merchant availability
- Use hybrid fetch with scraping fallback

### Issue: Slow API response

**Possible causes:**
1. Cuelinks API rate limiting
2. Cold start (Render free tier)
3. Network latency

**Solutions:**
- Reduce `limit` parameter
- Upgrade to paid Render plan
- Use caching for common queries

## Next Steps

### Recommended Improvements

1. **Add Caching**
   - Cache API responses for 1-6 hours
   - Reduce API calls and improve speed
   - Use Redis or in-memory cache

2. **Implement Background Jobs**
   - Fetch new products daily via cron job
   - Keep database fresh with latest offers
   - Update prices automatically

3. **Add More Filters**
   - Price range filtering
   - Brand filtering
   - Category filtering
   - Discount percentage filtering

4. **Analytics Dashboard**
   - Track which platforms users prefer
   - Monitor conversion rates
   - A/B test different product displays

5. **User Features**
   - Price drop alerts
   - Wishlist with price tracking
   - Compare products across platforms
   - Personalized recommendations

## Summary

You now have a **complete platform API integration** that:

✅ Fetches products from 7 major e-commerce platforms via Cuelinks API
✅ Automatically generates affiliate links with tracking
✅ Supports both API-only and hybrid (API + scraping) modes
✅ Saves products to MongoDB with price history
✅ Groups similar products across platforms
✅ Provides comprehensive API endpoints
✅ Is production-ready and deployed

**Main Benefits:**
- More reliable than web scraping
- Faster product updates
- Better data quality
- Automatic affiliate tracking
- Lower maintenance

**Revenue Tracking:**
- All clicks tracked via Cuelinks SubIDs
- View performance by platform and product
- Monitor conversions in Cuelinks dashboard

---

**Generated:** October 18, 2025
**Status:** ✅ Production Ready
**Publisher ID:** 217482
