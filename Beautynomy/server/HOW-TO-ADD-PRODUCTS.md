# How to Add Real Amazon Products with Affiliate Tracking

## Quick Start (5 minutes)

### Step 1: Find Products on Amazon

1. Go to https://www.amazon.in/
2. Search for popular beauty products:
   - "maybelline foundation"
   - "lakme kajal"
   - "sugar lipstick"
   - "minimalist serum"
   - "neutrogena sunscreen"

3. Click on a product you want to add

### Step 2: Copy Product Details

From the Amazon product page, copy:

- **Product Name**: Full name from the title (e.g., "Maybelline New York Fit Me Matte + Poreless Foundation, 220 Natural Beige")
- **Brand**: Brand name (e.g., "MAYBELLINE")
- **Price**: Current price in ₹ (e.g., 399)
- **Description**: First 1-2 lines from "About this item"
- **URL**: Full URL from browser address bar
- **Rating**: Star rating (e.g., 4.3)
- **Reviews**: Number of reviews (e.g., 12847)

### Step 3: Add to Script

1. Open: `server/scripts/add-amazon-products-simple.js`

2. Find the `PRODUCTS` array (around line 22)

3. Add your product:

```javascript
const PRODUCTS = [
  // Example product - you can keep or remove this
  {
    name: "Maybelline New York Fit Me Matte + Poreless Foundation, 220 Natural Beige",
    brand: "MAYBELLINE",
    category: "Foundation",
    description: "Lightweight foundation that refines pores and controls shine",
    amazonUrl: "https://www.amazon.in/Maybelline-Matte-Poreless-Foundation-Natural/dp/B071VKJKVC",
    price: 399,
    image: "https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400",
    rating: 4.3,
    reviews: 12847
  },

  // YOUR PRODUCT HERE - Just copy the template above and change the details
  {
    name: "PASTE_PRODUCT_NAME_HERE",
    brand: "BRAND_NAME",
    category: "Foundation", // or "Lipstick", "Kajal", "Serum", "Skincare"
    description: "PASTE_DESCRIPTION_HERE",
    amazonUrl: "PASTE_AMAZON_URL_HERE",
    price: 0,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    rating: 4.0,
    reviews: 0
  },
];
```

### Step 4: Run the Script

```bash
cd /Users/gaurav/Beautynomy/server
node scripts/add-amazon-products-simple.js
```

You'll see:
```
✅ Added successfully! (ID: 229)
   💰 Price: ₹399
   ⭐ Rating: 4.3 (12847 reviews)

🎉 Success! Check your website to see the new products!
```

### Step 5: Verify on Website

1. Go to https://www.beatynomy.in
2. Search for the product you just added
3. Click "Compare Prices" → Click the Amazon price
4. Verify the URL has `?tag=beautynomy25-21` at the end

**That's it! Your affiliate tracking is working!**

---

## Category Guide

Use these categories when adding products:

- **Foundation** - Liquid/powder foundations, BB creams, CC creams
- **Lipstick** - Lipsticks, lip glosses, lip stains, liquid lipsticks
- **Kajal** - Kajal, eyeliner, mascara
- **Eyeshadow** - Eyeshadow palettes, single shadows
- **Face** - Blush, highlighter, bronzer, compact powder
- **Skincare** - Face wash, cleansers, moisturizers, serums, toners
- **Sunscreen** - Sunscreen, SPF products
- **Makeup Tools** - Brushes, sponges, applicators

---

## Product Image Tips

### Option 1: Use Unsplash (Free)
Go to https://unsplash.com/ and search for:
- "foundation makeup"
- "lipstick"
- "skincare serum"
- "beauty product"

Copy the image URL (add `?w=400` at the end for optimization)

### Option 2: Use Amazon's Image (Not Recommended)
Right-click the product image → "Copy Image Address"

**Note:** Amazon images might expire or have copyright issues. Unsplash is safer.

---

## Example: Adding 5 Products at Once

```javascript
const PRODUCTS = [
  {
    name: "Lakme 9 to 5 Primer + Matte Powder Foundation Compact, Ivory Cream",
    brand: "LAKME",
    category: "Foundation",
    description: "Long-lasting matte finish foundation with built-in primer",
    amazonUrl: "https://www.amazon.in/Lakme-Primer-Foundation-Compact-Natural/dp/B01B2WNFQO",
    price: 345,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    rating: 4.1,
    reviews: 8542
  },
  {
    name: "Maybelline New York Colossal Kajal, Black, 0.35g",
    brand: "MAYBELLINE",
    category: "Kajal",
    description: "Smudge-proof kajal with intense black color",
    amazonUrl: "https://www.amazon.in/Maybelline-Colossal-Kajal-Black-0-35g/dp/B00A3FD9KK",
    price: 155,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400",
    rating: 4.3,
    reviews: 15234
  },
  {
    name: "SUGAR Cosmetics Smudge Me Not Liquid Lipstick - 01 Pink O' Clock",
    brand: "SUGAR",
    category: "Lipstick",
    description: "Transfer-proof liquid lipstick with matte finish",
    amazonUrl: "https://www.amazon.in/SUGAR-Cosmetics-Smudge-Liquid-Lipstick/dp/B07BQSF7MS",
    price: 499,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
    rating: 4.2,
    reviews: 6789
  },
  {
    name: "Minimalist Vitamin C 10% Face Serum for Glowing Skin, 30ml",
    brand: "MINIMALIST",
    category: "Skincare",
    description: "Brightening serum with 10% pure Vitamin C and antioxidants",
    amazonUrl: "https://www.amazon.in/Minimalist-Vitamin-Glowing-Brightening-Reduction/dp/B08CHL14Y8",
    price: 699,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    rating: 4.4,
    reviews: 23456
  },
  {
    name: "Neutrogena Ultra Sheer Dry-Touch Sunblock SPF 50+, 88ml",
    brand: "NEUTROGENA",
    category: "Sunscreen",
    description: "Non-greasy, water-resistant sunscreen with broad spectrum protection",
    amazonUrl: "https://www.amazon.in/Neutrogena-Ultra-Dry-Touch-Sunblock-Avobenzone/dp/B01BU08UZU",
    price: 649,
    image: "https://images.unsplash.com/photo-1556228578-dd526cba4b4e?w=400",
    rating: 4.5,
    reviews: 18234
  }
];
```

**Run once, adds all 5 products with affiliate tracking automatically!**

---

## Tracking Your Commissions

### Amazon Associates Dashboard

1. Login: https://affiliate.amazon.in/
2. Go to **Reports** → **Earnings**
3. Check:
   - **Clicks**: Should appear within 24 hours
   - **Orders**: Within 2-3 days of purchase
   - **Earnings**: Within 2-3 days of order

### What You'll Earn

**Commission Rates:**
- Beauty Products: 4-8%
- Luxury Beauty: 10%
- Cookie Duration: 24 hours

**Example:**
- Product Price: ₹399
- Commission Rate: 6%
- **Your Earning: ₹24 per sale**

With 10 sales/day = ₹240/day = ₹7,200/month from just one product!

---

## Tips for Success

### DO:
✅ Add popular, high-rated products (4+ stars)
✅ Use products with 1000+ reviews
✅ Start with 10-20 products, expand gradually
✅ Test affiliate links before going live
✅ Use clear product images
✅ Keep descriptions concise

### DON'T:
❌ Copy product descriptions verbatim (copyright)
❌ Use fake/manipulated reviews
❌ Add products you can't verify
❌ Use expired or broken URLs
❌ Spam products (quality over quantity)

---

## Troubleshooting

**"Product already exists"**
→ Product with same name already in database. Change the name slightly or skip it.

**"Could not determine last ID"**
→ Script will use a safe ID. Your product will still be added correctly.

**"E11000 duplicate key error"**
→ Product ID conflict. Just run the script again - it will use the next available ID.

**Affiliate link doesn't have my tag**
→ Check `server/utils/affiliate-link-generator.js` - make sure `enabled: true` for Amazon.

**Product not showing on website**
→ Wait 1-2 minutes for cache to refresh, then reload the page.

---

## Next Steps

1. **Add 10-20 popular products** using this script
2. **Test all affiliate links** - click them and verify tag is present
3. **Monitor Amazon dashboard** for clicks (wait 24 hours)
4. **Add more platforms**:
   - Flipkart: https://affiliate.flipkart.com/
   - Nykaa/Myntra: Sign up on Admitad
5. **Market your site**:
   - Share on social media
   - Create Instagram/Facebook page
   - SEO optimization
   - Beauty blogger outreach

---

## Need Help?

Check these files:
- `server/AFFILIATE-SETUP-GUIDE.md` - Complete affiliate setup for all platforms
- `server/QUICK-START-AMAZON.md` - Detailed Amazon product collection guide
- `server/scripts/test-amazon-affiliate.js` - Test your affiliate link generation

**Happy affiliate marketing! 💰**
