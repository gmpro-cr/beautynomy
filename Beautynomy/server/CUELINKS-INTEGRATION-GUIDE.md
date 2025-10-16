# Cuelinks Integration Guide for Beautynomy

## Overview

Cuelinks has been integrated into Beautynomy to provide advanced affiliate link management and product discovery. This integration enables automatic conversion of product URLs to trackable affiliate links and access to merchant offers.

## Features

### 1. **Automatic Deeplink Conversion**
- Converts all product URLs to Cuelinks deeplinks during scraping
- Tracks clicks and conversions through Cuelinks platform
- Falls back to original URLs if Cuelinks is not configured

### 2. **Merchant Discovery**
- Fetch available merchants/advertisers from Cuelinks
- Access merchant campaigns and offers
- Filter products by merchant

### 3. **Product Search via Cuelinks**
- Search for products across all Cuelinks merchants
- Get live offers and deals
- Filter by category, merchant, etc.

### 4. **Bulk URL Conversion**
- Convert existing product URLs to Cuelinks deeplinks
- Process multiple products in batches
- Maintain original URLs as fallback

## Setup Instructions

### Step 1: Get Cuelinks Credentials

1. Visit [Cuelinks.com](https://www.cuelinks.com)
2. Create a publisher account (free to join)
3. Navigate to **Settings > API Integration**
4. Copy your:
   - **API Key** (32-character token)
   - **Publisher ID**

### Step 2: Configure Environment Variables

Add to your `server/.env` file:

```env
# Cuelinks Configuration
CUELINKS_API_KEY=your_32_character_api_key_here
CUELINKS_PUBLISHER_ID=your_publisher_id_here
```

### Step 3: Restart Server

```bash
cd Beautynomy/server
npm start
```

The server will automatically detect Cuelinks configuration and enable deeplink conversion.

## API Endpoints

### Check Cuelinks Status

**GET** `/api/cuelinks/status`

Returns Cuelinks configuration status.

**Response:**
```json
{
  "message": "Cuelinks integration status",
  "configured": true,
  "apiKey": "***xyz4",
  "publisherId": "123456",
  "baseURL": "https://www.cuelinks.com/api/v2"
}
```

### Generate Single Deeplink

**POST** `/api/cuelinks/deeplink`

Convert a single URL to Cuelinks deeplink.

**Request:**
```json
{
  "url": "https://www.nykaa.com/product-page",
  "subId": "nykaa-lipstick-123"
}
```

**Response:**
```json
{
  "success": true,
  "originalUrl": "https://www.nykaa.com/product-page",
  "deeplink": "https://cutt.ly/xyz123",
  "isConverted": true
}
```

### Get Available Merchants

**GET** `/api/cuelinks/merchants`

Fetch all available merchants from Cuelinks.

**Response:**
```json
{
  "success": true,
  "count": 450,
  "merchants": [
    {
      "id": 123,
      "name": "Nykaa",
      "category": "Beauty & Personal Care",
      "commission": "5-10%",
      "status": "active"
    }
  ]
}
```

### Search Products

**GET** `/api/cuelinks/search?query=lipstick&category=beauty`

Search for products/offers via Cuelinks.

**Query Parameters:**
- `query` (required): Search term
- `category` (optional): Filter by category
- `merchant` (optional): Filter by merchant

**Response:**
```json
{
  "success": true,
  "query": "lipstick",
  "count": 25,
  "products": [
    {
      "id": "offer-123",
      "name": "Maybelline SuperStay Lipstick",
      "description": "Long-lasting lipstick",
      "merchant": "Nykaa",
      "url": "https://cutt.ly/xyz",
      "category": "Beauty",
      "discount": "20% OFF",
      "imageUrl": "https://...",
      "validUntil": "2025-12-31"
    }
  ]
}
```

### Convert Product URLs

**POST** `/api/cuelinks/convert-product`

Convert all URLs of an existing product to Cuelinks deeplinks.

**Request:**
```json
{
  "productId": "maybelline-superstay-lipstick"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product URLs converted to Cuelinks deeplinks",
  "product": {
    "_id": "maybelline-superstay-lipstick",
    "name": "Maybelline SuperStay Lipstick",
    "prices": [
      {
        "platform": "Nykaa",
        "amount": 599,
        "url": "https://cutt.ly/nykaa-link",
        "isAffiliateLink": true
      }
    ]
  }
}
```

## How It Works

### Automatic Conversion During Scraping

When you scrape products using `/api/scrape`, the scraper service automatically converts URLs:

1. **Scrape products** from e-commerce platforms
2. **Check Cuelinks configuration** - is API key set?
3. **Convert URLs** to Cuelinks deeplinks for each platform
4. **Save to database** with converted URLs
5. **Track conversions** through Cuelinks dashboard

```javascript
// Example flow
const prices = [
  { platform: 'Nykaa', amount: 599, url: 'https://nykaa.com/...' },
  { platform: 'Amazon', amount: 549, url: 'https://amazon.in/...' }
];

// After Cuelinks conversion
const convertedPrices = [
  { platform: 'Nykaa', amount: 599, url: 'https://cutt.ly/xyz', isAffiliateLink: true },
  { platform: 'Amazon', amount: 549, url: 'https://cutt.ly/abc', isAffiliateLink: true }
];
```

### SubID Tracking

Each converted URL includes a subID for granular tracking:

- Format: `{platform}-{productId}`
- Example: `nykaa-maybelline-lipstick`
- View in Cuelinks dashboard under "SubID Reports"

## Benefits

### 1. **Unified Affiliate Management**
- Single platform for all affiliate links
- No need to manage multiple affiliate programs
- Cuelinks handles relationships with merchants

### 2. **Better Tracking**
- Track clicks, conversions, and commissions
- SubID tracking for detailed analytics
- Real-time reporting in Cuelinks dashboard

### 3. **Higher Commissions**
- Cuelinks may offer better rates than direct programs
- Access to exclusive deals and bonuses
- Performance-based commission increases

### 4. **Simplified Integration**
- One API for all merchants
- Automatic link updates when merchants change
- No broken affiliate links

## Testing Cuelinks Integration

### Test 1: Check Status

```bash
curl http://localhost:5000/api/cuelinks/status
```

Expected: Configuration details with `"configured": true`

### Test 2: Generate Deeplink

```bash
curl -X POST http://localhost:5000/api/cuelinks/deeplink \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.nykaa.com/maybelline-superstay-matte-ink-liquid-lipstick/p/405933",
    "subId": "test-link"
  }'
```

Expected: Shortened Cuelinks URL

### Test 3: Scrape with Auto-Conversion

```bash
curl -X POST http://localhost:5000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"productName": "Maybelline lipstick"}'
```

Expected: Products with `isAffiliateLink: true` in prices

### Test 4: Search Products

```bash
curl "http://localhost:5000/api/cuelinks/search?query=lipstick&category=beauty"
```

Expected: List of offers from Cuelinks merchants

## Troubleshooting

### Issue: "Cuelinks not configured" Error

**Solution:**
1. Check `.env` file has `CUELINKS_API_KEY` and `CUELINKS_PUBLISHER_ID`
2. Restart server after adding credentials
3. Verify credentials are correct (32-character API key)

### Issue: URLs Not Converting

**Possible causes:**
1. Invalid API key
2. API rate limiting
3. Network timeout

**Solution:**
- Check server logs for error messages
- Verify Cuelinks account is active
- Contact Cuelinks support if issues persist

### Issue: No Merchants Returned

**Solution:**
- Your Cuelinks account may need approval
- Some merchants require manual activation
- Check Cuelinks dashboard for active campaigns

## Best Practices

### 1. **Always Use SubID Tracking**
```javascript
const subId = `${platform}-${productId}`;
await cuelinksService.generateDeeplink(url, subId);
```

### 2. **Batch Process When Possible**
```javascript
// Better performance
const converted = await cuelinksService.generateBulkDeeplinks(products);

// Instead of
for (const product of products) {
  await cuelinksService.generateDeeplink(product.url);
}
```

### 3. **Handle Fallbacks Gracefully**
The service automatically falls back to original URLs if Cuelinks fails.

### 4. **Monitor Performance**
- Check Cuelinks dashboard weekly
- Track conversion rates by platform
- Optimize based on performance data

## Advanced Usage

### Custom Deeplink Generation in Frontend

You can also generate deeplinks from the frontend:

```javascript
const response = await fetch('http://localhost:5000/api/cuelinks/deeplink', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: productUrl,
    subId: `${platform}-${productId}-${userId}`
  })
});

const { deeplink } = await response.json();
window.open(deeplink, '_blank');
```

### Bulk Conversion Script

Convert all existing products to Cuelinks:

```javascript
// Create: server/scripts/convert-all-to-cuelinks.js
import Product from '../models/Product.js';
import cuelinksService from '../services/cuelinks-service.js';

const products = await Product.find({});

for (const product of products) {
  const converted = await cuelinksService.convertPricesToDeeplinks(
    product.prices,
    product._id
  );
  product.prices = converted;
  await product.save();
  console.log(`✅ Converted: ${product.name}`);
}
```

## Revenue Tracking

### View Earnings in Cuelinks Dashboard

1. Login to [Cuelinks Dashboard](https://www.cuelinks.com/login)
2. Navigate to **Reports > Earnings**
3. Filter by:
   - Date range
   - SubID (to see per-product/platform performance)
   - Merchant
   - Status (pending, approved, rejected)

### Export Reports

- Download CSV/Excel reports
- Integrate with analytics tools
- Track monthly growth

## Support

### Cuelinks Support
- Email: support@cuelinks.com
- Help Center: https://cuelinks.zohodesk.com

### Beautynomy Support
- Check server logs: `tail -f server/logs/error.log`
- GitHub Issues: [Create an issue](https://github.com/yourusername/beautynomy/issues)

## Changelog

### Version 1.0 (Current)
- ✅ Automatic deeplink conversion during scraping
- ✅ Manual deeplink generation API
- ✅ Merchant discovery
- ✅ Product search via Cuelinks
- ✅ Bulk URL conversion
- ✅ SubID tracking support

### Planned Features
- 🔄 Automatic link health checks
- 🔄 Commission rate display
- 🔄 A/B testing for different affiliate networks
- 🔄 Analytics integration with Google Analytics
