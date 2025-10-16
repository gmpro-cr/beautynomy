# Cuelinks Product Fetching Guide

## Overview

This guide explains how to fetch product details from e-commerce sites using Cuelinks integration in Beautynomy.

## Important Understanding

### What Cuelinks Provides

Cuelinks offers two main types of data through their API:

1. **Merchant/Campaign Data** - Information about available merchants and their affiliate programs
2. **Offers/Deals API** - Promotional offers, deals, and coupons from merchants

**Note:** Cuelinks does NOT provide a product catalog API with individual product listings (like "Maybelline Lipstick #123"). Instead, they provide:
- Merchant offers and deals
- Promotional campaigns
- Discount coupons
- Special sale events

### What You Have Built

Your Beautynomy app has **two complementary systems**:

#### 1. **Web Scraping System** (Already Working)
- **Purpose:** Fetch actual product details (name, price, images, ratings)
- **Source:** Direct from e-commerce sites (Nykaa, Amazon, Flipkart)
- **Data:** Individual product listings with prices
- **Endpoints:** `/api/scrape`, `/api/scrape/batch`

#### 2. **Cuelinks Affiliate System** (Now Enhanced)
- **Purpose:** Convert URLs to trackable affiliate links & discover offers
- **Source:** Cuelinks API
- **Data:** Affiliate links, promotional offers, merchant campaigns
- **Endpoints:** `/api/cuelinks/*`

---

## How It Works Together

### Recommended Workflow

```
Step 1: Find Products
   ↓ Use Web Scraping
   GET /api/scrape {"productName": "Maybelline lipstick"}
   → Returns: Product details from Nykaa, Amazon, Flipkart

Step 2: Convert to Affiliate Links
   ↓ Automatic via Cuelinks
   → All URLs automatically become Cuelinks tracking links
   → Format: https://linksredirect.com/?pub_id=217482&url=...

Step 3: Save to Database
   ↓ Automatic
   → Products saved with Cuelinks affiliate URLs
   → Ready to display to users

Step 4: Track & Earn
   ↓ User clicks → Cuelinks tracks → Purchase → Commission
   → View in Cuelinks Dashboard
```

---

## API Endpoints

### Product Scraping (Get Product Details)

**1. Scrape Single Product**
```bash
POST /api/scrape
Content-Type: application/json

{
  "productName": "Maybelline SuperStay Lipstick"
}

Response:
{
  "success": true,
  "message": "Found and updated 3 products",
  "products": [
    {
      "name": "Maybelline SuperStay Matte Ink",
      "brand": "MAYBELLINE",
      "prices": [
        {
          "platform": "Nykaa",
          "amount": 599,
          "url": "https://linksredirect.com/?pub_id=217482&url=https%3A%2F%2Fwww.nykaa.com%2F...",
          "isAffiliateLink": true
        }
      ]
    }
  ]
}
```

**2. Batch Scrape Multiple Products**
```bash
POST /api/scrape/batch
Content-Type: application/json

{
  "productNames": [
    "Lakme 9to5 Primer",
    "Maybelline Fit Me Foundation",
    "Nykaa Matte Lipstick"
  ]
}

Response:
{
  "success": true,
  "total": 3,
  "successful": 3,
  "results": [...]
}
```

### Cuelinks Integration (Affiliate Links & Offers)

**1. Check Status**
```bash
GET /api/cuelinks/status

Response:
{
  "configured": true,
  "publisherId": "217482",
  "apiKey": "***PK7w"
}
```

**2. Fetch Merchant Offers**
```bash
GET /api/cuelinks/fetch-products?query=beauty&limit=10

Response:
{
  "success": true,
  "count": 10,
  "products": [
    {
      "name": "Nykaa Festive Sale: Up to 50% Off",
      "merchant": "Nykaa",
      "offerText": "Get 50% off on selected items",
      "affiliateUrl": "https://linksredirect.com/...",
      "validUntil": "2025-12-31"
    }
  ]
}
```

**3. Import Offers to Database**
```bash
POST /api/cuelinks/import-products
Content-Type: application/json

{
  "query": "skincare",
  "limit": 20,
  "autoImport": true
}

Response:
{
  "success": true,
  "message": "Imported 15 products, updated 3, skipped 2",
  "results": {
    "total": 20,
    "imported": 15,
    "updated": 3,
    "skipped": 2
  }
}
```

**4. Convert Existing Product**
```bash
POST /api/cuelinks/convert-product
Content-Type: application/json

{
  "productId": "236"
}

Response:
{
  "success": true,
  "message": "Product URLs converted to Cuelinks deeplinks",
  "product": {...}
}
```

---

## Use Cases

### Use Case 1: Add New Products to Your Database

**Scenario:** You want to add Maybelline lipsticks to your website

**Steps:**
```bash
# 1. Scrape product details
curl -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"productName": "Maybelline SuperStay Lipstick"}'

# Result: Products automatically added with:
# - Product details (name, brand, description)
# - Prices from multiple platforms
# - Cuelinks affiliate URLs (automatic)
# - Saved to MongoDB
```

### Use Case 2: Discover Promotional Offers

**Scenario:** You want to show current beauty deals on your homepage

**Steps:**
```bash
# 1. Fetch beauty offers from Cuelinks
curl "http://localhost:5001/api/cuelinks/fetch-products?query=beauty&limit=20"

# Result: Get promotional offers like:
# - "Nykaa: 50% Off on Lakme Products"
# - "Amazon: Buy 2 Get 1 Free on L'Oreal"
# - Each with affiliate tracking link
```

### Use Case 3: Bulk Import Products

**Scenario:** You want to quickly populate your database with skincare products

**Steps:**
```bash
# 1. Scrape multiple products at once
curl -X POST http://localhost:5001/api/scrape/batch \
  -H "Content-Type: application/json" \
  -d '{
    "productNames": [
      "Cetaphil Face Wash",
      "Neutrogena Moisturizer",
      "Plum Vitamin C Serum",
      "WOW Apple Cider Vinegar Shampoo"
    ]
  }'

# Result: All products scraped, converted to Cuelinks, saved to DB
```

### Use Case 4: Update Existing Products

**Scenario:** Convert old products to use Cuelinks affiliate links

**Steps:**
```bash
# 1. Get product ID
curl "http://localhost:5001/api/products?query=lipstick"

# 2. Convert to Cuelinks
curl -X POST http://localhost:5001/api/cuelinks/convert-product \
  -H "Content-Type: application/json" \
  -d '{"productId": "236"}'

# Result: Product URLs updated to Cuelinks tracking links
```

---

## Complete Example Workflow

### Building a Beauty Product Website

**Step 1: Initial Setup** ✅ (Already Done)
```bash
# Cuelinks configured in .env
CUELINKS_API_KEY=r1QSVw_7PJghKr-Y4dhkuToMrUW0Ut0-DNwZroQPK7w
CUELINKS_PUBLISHER_ID=217482
```

**Step 2: Add Products**
```javascript
// Scrape and add lipsticks
const lipstickBrands = [
  "Maybelline SuperStay Matte Ink",
  "Lakme 9to5 Primer Matte Lipstick",
  "Sugar Smudge Me Not Liquid Lipstick",
  "Nykaa Ultra Matte Lipstick"
];

for (const productName of lipstickBrands) {
  await fetch('/api/scrape', {
    method: 'POST',
    body: JSON.stringify({ productName })
  });
}

// Result: All products in database with Cuelinks links
```

**Step 3: Display on Website**
```javascript
// Frontend: Get products
const products = await fetch('/api/products?category=Lips').then(r => r.json());

// Show to users with affiliate links
products.forEach(product => {
  console.log(product.name);
  product.prices.forEach(price => {
    // This URL has Cuelinks tracking!
    console.log(`${price.platform}: ₹${price.amount}`);
    console.log(`Link: ${price.url}`); // Cuelinks affiliate link
  });
});
```

**Step 4: Track Revenue**
```bash
# Login to Cuelinks Dashboard
https://www.cuelinks.com/publisher/dashboard

# View Reports → Earnings
# Filter by SubID to see which products convert
# Example: "Nykaa-maybelline-superstay" shows Maybelline lipstick sales
```

---

## API Reference Summary

### Scraping APIs (Get Product Details)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/scrape` | POST | Scrape single product |
| `/api/scrape/batch` | POST | Scrape multiple products |
| `/api/update-prices` | POST | Update prices for existing products |

### Cuelinks APIs (Affiliate & Offers)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cuelinks/status` | GET | Check configuration |
| `/api/cuelinks/deeplink` | POST | Generate single deeplink |
| `/api/cuelinks/convert-product` | POST | Convert product URLs |
| `/api/cuelinks/fetch-products` | GET | Fetch merchant offers |
| `/api/cuelinks/import-products` | POST | Import offers to DB |
| `/api/cuelinks/merchants` | GET | Get available merchants |
| `/api/cuelinks/search` | GET | Search merchant offers |

### Product APIs (Database)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET | Get all products |
| `/api/products/:id` | GET | Get single product |
| `/api/brands` | GET | Get all brands |
| `/api/categories` | GET | Get all categories |
| `/api/stats` | GET | Get statistics |

---

## Best Practices

### 1. Product Discovery Strategy

**Primary Method: Web Scraping**
```javascript
// Use scraping to get actual products with details
await fetch('/api/scrape', {
  method: 'POST',
  body: JSON.stringify({
    productName: "Maybelline Fit Me Foundation"
  })
});
```

**Secondary Method: Cuelinks Offers**
```javascript
// Use Cuelinks to discover promotional deals
const offers = await fetch('/api/cuelinks/fetch-products?query=beauty');
// Display these as "Special Offers" or "Deals" section
```

### 2. Affiliate Link Management

**Automatic (Recommended)**
- All scraped products automatically get Cuelinks links
- No manual intervention needed
- Links saved to database

**Manual Conversion**
```javascript
// Convert existing products if needed
await fetch('/api/cuelinks/convert-product', {
  method: 'POST',
  body: JSON.stringify({ productId: '236' })
});
```

### 3. Revenue Optimization

**Track Performance**
```bash
# Check Cuelinks Dashboard weekly
# Analyze which products convert best
# Focus scraping on high-performing categories
```

**SubID Analysis**
```
Format: {Platform}-{ProductID}

Examples:
- Nykaa-maybelline-lipstick → Track Maybelline lipstick sales on Nykaa
- Amazon-lakme-foundation → Track Lakme foundation sales on Amazon
```

---

## Limitations & Solutions

### Limitation 1: No Direct Product Catalog

**Issue:** Cuelinks doesn't provide a searchable product database

**Solution:** Use web scraping for product discovery
```bash
# Instead of searching Cuelinks for "lipstick products"
# Scrape from actual e-commerce sites
POST /api/scrape {"productName": "lipstick"}
```

### Limitation 2: Offer Data vs Product Data

**Issue:** Cuelinks returns promotional offers, not individual products

**Solution:** Use offers for marketing, scraping for products
```javascript
// Products Section: Use scraped data
const products = await fetch('/api/products');

// Deals Section: Use Cuelinks offers
const deals = await fetch('/api/cuelinks/fetch-products');
```

### Limitation 3: API Rate Limits

**Issue:** Cuelinks may have rate limits on API calls

**Solution:** Cache results and batch requests
```javascript
// Fetch once, cache for 24 hours
const offers = await fetchCuelinksOffers();
cache.set('cuelinks-offers', offers, 86400);
```

---

## Testing

### Test Product Fetching
```bash
cd /Users/gaurav/Beautynomy/server
node test-product-fetch.js
```

### Test Scraping Integration
```bash
node test-scraper-cuelinks.js
```

### Test Live API
```bash
# Scrape a product
curl -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"productName": "Maybelline lipstick"}'

# Check it has Cuelinks links
curl "http://localhost:5001/api/products?query=maybelline" | grep linksredirect
```

---

## Conclusion

### What You Have

✅ **Web Scraping System**
- Fetches real product details from e-commerce sites
- Gets prices, images, ratings, descriptions
- Works with Nykaa, Amazon, Flipkart, Purplle, Myntra

✅ **Cuelinks Integration**
- Automatically converts all URLs to affiliate links
- Tracks clicks and conversions
- Provides promotional offers and deals
- Unified commission tracking

### Recommended Approach

```
1. Use Web Scraping for Products
   └─ GET /api/scrape → Actual product listings

2. Use Cuelinks for Affiliate Links (Automatic)
   └─ URLs auto-converted → Tracking enabled

3. Use Cuelinks Offers for Promotions (Optional)
   └─ GET /api/cuelinks/fetch-products → Deal banners

4. Track Everything in Cuelinks Dashboard
   └─ Reports → Earnings → Filter by SubID
```

### Start Earning

Your system is ready! Just scrape products and they'll automatically have Cuelinks affiliate links. Every user click is tracked, every purchase earns commission.

**Server:** http://localhost:5001  
**Database:** 262 products (ready to convert)  
**Cuelinks:** Configured and active  

🎉 **You're ready to start earning affiliate commissions!** 💰
