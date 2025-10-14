# Flipkart Affiliate Program Setup Guide

## Overview
Flipkart's affiliate program allows you to earn commissions (2-10%) on sales while getting legal access to product data and pricing.

## Affiliate Program Options

### 1. **Flipkart Affiliate Program (Official)**
- **Website**: https://affiliate.flipkart.com/
- **Commission**: 2-10% depending on category
- **Features**:
  - Product feeds (CSV/XML)
  - Deep linking tools
  - Real-time tracking
  - API access (for approved publishers)

### 2. **Third-Party Affiliate Networks**
Several networks also offer Flipkart affiliate programs:
- **Admitad**: https://www.admitad.com/
- **vCommission**: https://www.vcommission.com/
- **CueLinks**: https://www.cuelinks.com/

## Step-by-Step Setup

### Step 1: Sign Up for Flipkart Affiliate

1. Go to: https://affiliate.flipkart.com/
2. Click **"Join Now"** or **"Sign Up"**
3. Fill in your details:
   - Name & Email
   - Website URL (use: `https://beautynomy-client.vercel.app`)
   - Traffic details
   - PAN card (for payments)
4. Submit application
5. Wait for approval (usually 1-3 days)

### Step 2: Get Your Affiliate ID

Once approved:
1. Login to https://affiliate.flipkart.com/
2. Go to **Dashboard** → **Account Settings**
3. Find your **Affiliate ID** (format: `beautynomy` or similar)
4. Note your **Tracking ID** (used in links)

### Step 3: Generate Affiliate Links

Flipkart affiliate links follow this format:

```
https://www.flipkart.com/product-url?affid=YOUR_AFFILIATE_ID&affExtParam1=tracking_param
```

**Example:**
```
Original: https://www.flipkart.com/maybelline-fit-me-foundation/p/itm123
Affiliate: https://www.flipkart.com/maybelline-fit-me-foundation/p/itm123?affid=beautynomy
```

### Step 4: Access Product Feeds

Flipkart provides product feeds in CSV/XML format:

1. Login to affiliate dashboard
2. Go to **Tools** → **Product Feeds**
3. Select **Category**: Beauty & Personal Care
4. Download feed (updated daily)
5. Parse feed for:
   - Product names
   - Prices
   - Images
   - Affiliate links
   - Stock status

## Using Product Feeds

### Feed Structure (CSV)
```csv
product_id,product_name,price,mrp,discount,category,brand,image_url,product_url,affiliate_url
FKP123,Maybelline Fit Me Foundation,399,499,20%,Foundation,Maybelline,https://...,https://...,https://...?affid=xxx
```

### API Access (For High-Volume Publishers)

If approved for API access:

**Endpoint**: `https://affiliate-api.flipkart.net/affiliate/api/`

**Authentication**: Bearer token from dashboard

**Example Request**:
```bash
curl -X GET "https://affiliate-api.flipkart.net/affiliate/api/products?category=beauty&limit=100" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

## Integration with Beautynomy

### Option A: Manual Feed Update (Recommended for Start)

1. Download product feed daily
2. Parse CSV/XML file
3. Match products by name/brand
4. Update prices in `products-data.js`
5. Update affiliate URLs

### Option B: Automated Feed Sync

Create a scheduled job that:
1. Fetches feed daily
2. Parses and updates prices
3. Stores in database
4. Updates frontend automatically

### Option C: Real-Time API (If Approved)

Implement API integration for:
- Real-time price checks
- Stock availability
- Dynamic link generation

## Commission Rates (Beauty Category)

| Category | Commission |
|----------|-----------|
| Makeup | 4-6% |
| Skincare | 3-5% |
| Haircare | 4-7% |
| Fragrances | 2-4% |
| Beauty Tools | 5-8% |

## Best Practices

1. **Link Format**:
   - Always use deep links (direct product pages)
   - Include your affiliate ID
   - Add tracking parameters for analytics

2. **Disclosure**:
   - Display affiliate disclosure (already done ✅)
   - Be transparent with users

3. **Link Maintenance**:
   - Check for broken links monthly
   - Update discontinued products
   - Verify prices are current

4. **Performance Tracking**:
   - Monitor clicks and conversions
   - Track which products perform best
   - Optimize based on data

## Alternative: Universal Link Solutions

If managing multiple affiliates (Nykaa, Amazon, Flipkart) is complex, consider:

### **CueLinks** (Recommended)
- **Website**: https://www.cuelinks.com/
- **Features**:
  - Auto-converts links for 500+ merchants
  - Single integration for multiple affiliates
  - Real-time reporting
  - No need to manage individual programs

### **AdmitAd**
- Similar to CueLinks
- Manages multiple affiliate programs
- Single tracking code

## Next Steps

1. ✅ Sign up for Flipkart Affiliate
2. ✅ Get approved (provide website details)
3. ✅ Get Affiliate ID
4. ✅ Download product feed OR get API access
5. ✅ Integrate with Beautynomy backend
6. ✅ Update product URLs with affiliate links
7. ✅ Set up automated price updates

## Support

- **Flipkart Affiliate Support**: affiliate-support@flipkart.com
- **Documentation**: https://affiliate.flipkart.com/help
- **Phone**: Check dashboard for support number

## Estimated Timeline

- Application submission: 5 minutes
- Approval wait: 1-3 business days
- Integration: 1-2 hours
- Testing: 1 hour

**Total**: Can be live in 2-4 days!

## Legal Compliance

✅ Terms of Service compliant
✅ No scraping required
✅ Official partner status
✅ Legal earning potential
✅ Long-term sustainable solution

---

**Note**: This is the recommended approach for production. It's legal, sustainable, and you earn money from it!
