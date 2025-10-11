# Affiliate Setup & Real Product URLs Guide

## 📋 Overview

This guide will help you set up proper affiliate tracking and get real product URLs for Beautynomy. This is essential for production deployment.

---

## 🎯 What You Need To Do

### 1. Sign Up for Affiliate Programs (All Platforms)
### 2. Get Your Affiliate IDs/Tracking Codes
### 3. Learn Each Platform's URL Structure
### 4. Update Your Database with Real URLs
### 5. Test Your Affiliate Links

---

## 🛒 Platform-by-Platform Setup

### 1️⃣ Amazon India Affiliate Program

**Program Name:** Amazon Associates

**Sign Up:** https://affiliate.amazon.in/

**Requirements:**
- Valid PAN card (for tax purposes in India)
- Active website/social media presence
- Indian bank account for payments

**Approval Time:** Usually 1-3 days after you get your first 3 sales

**Commission Rates:**
- Beauty Products: 4-8%
- Luxury Beauty: 10%

**Your Affiliate Tag Format:**
```
beautynomy-21
```

**URL Structure:**
```
Original: https://www.amazon.in/product-name/dp/B08XYZ1234
Affiliate: https://www.amazon.in/product-name/dp/B08XYZ1234?tag=beautynomy-21

With SiteStripe: https://amzn.to/3abc123?tag=beautynomy-21
```

**How to Get Real Product URLs:**
1. Search for the product on Amazon India
2. Copy the product URL from browser
3. Add `?tag=YOUR-TAG` at the end
4. Example for Maybelline Fit Me Foundation:
   ```
   https://www.amazon.in/Maybelline-Matte-Poreless-Foundation-Natural/dp/B071VKJKVC?tag=beautynomy-21
   ```

**Amazon SiteStripe Tool:**
- Once approved, you'll get a browser toolbar
- Generates short affiliate links automatically
- Highly recommended!

---

### 2️⃣ Flipkart Affiliate Program

**Program Name:** Flipkart Affiliate

**Sign Up:** https://affiliate.flipkart.com/

**Requirements:**
- Active website with content
- PAN card for Indian residents
- Bank account details

**Approval Time:** 7-10 business days

**Commission Rates:**
- Beauty & Personal Care: 5-10%
- Premium Beauty: Up to 15%

**Your Affiliate ID Format:**
```
beautynomy (you choose this during signup)
```

**URL Structure:**
```
Original: https://www.flipkart.com/product-name/p/itmabcdef123
Affiliate: https://www.flipkart.com/product-name/p/itmabcdef123?affid=beautynomy

Or use their link generator tool
```

**How to Get Real Product URLs:**
1. Search product on Flipkart
2. Use their Link Generator tool (in affiliate dashboard)
3. Paste product URL → Get affiliate link
4. Example:
   ```
   https://www.flipkart.com/maybelline-fit-me-matte-poreless-foundation/p/itmf3h7xyzabc123?affid=beautynomy
   ```

**Flipkart Deep Link API:**
- They provide an API to convert any Flipkart URL to affiliate link
- You can automate this!

---

### 3️⃣ Nykaa Affiliate Program

**Program Name:** Nykaa Affiliate

**Sign Up:** Contact through: https://www.nykaa.com/contact-us
- Email: affiliates@nykaa.com
- Mention you run a beauty price comparison site

**OR** Join through affiliate networks:
- Admitad (https://www.admitad.com/)
- vCommission (https://www.vcommission.com/)

**Requirements:**
- Established website/app
- Beauty/lifestyle content
- Traffic proof may be required

**Approval Time:** 2-4 weeks (can be longer)

**Commission Rates:**
- Beauty Products: 5-8%
- Luxury Brands: 10-12%

**Affiliate Link Structure (via Admitad):**
```
https://ad.admitad.com/g/xxxxx/?ulp=https://www.nykaa.com/product-page
```

**How to Get Real Product URLs:**
1. Browse Nykaa and find products
2. Example URL structure:
   ```
   https://www.nykaa.com/maybelline-new-york-fit-me-matte-poreless-foundation/p/231482
   ```
3. After approval, wrap with affiliate network link:
   ```
   https://ad.admitad.com/g/YOUR_CODE/?ulp=https://www.nykaa.com/maybelline-new-york-fit-me-matte-poreless-foundation/p/231482
   ```

---

### 4️⃣ Purplle Affiliate Program

**Program Name:** Purplle Affiliate

**Sign Up:** https://www.purplle.com/influencer
- Or email: partnerships@purplle.com

**OR** Through networks:
- Admitad
- vCommission

**Requirements:**
- Active website/social presence
- Beauty content focus
- Basic traffic requirements

**Approval Time:** 1-2 weeks

**Commission Rates:**
- Beauty Products: 6-10%
- Purplle Exclusive: Up to 15%

**URL Structure:**
```
Direct: https://www.purplle.com/product/product-name
Affiliate (via network): Network tracking URL + product URL
```

**Example:**
```
https://www.purplle.com/product/maybelline-fit-me-matte-poreless-foundation/001234
```

---

### 5️⃣ Myntra Affiliate Program

**Program Name:** Myntra Affiliate

**Sign Up Through:**
- Admitad: https://www.admitad.com/
- Commission Junction (CJ)

**Requirements:**
- Fashion/beauty focused website
- Decent traffic
- Content quality

**Approval Time:** 1-3 weeks

**Commission Rates:**
- Beauty Products: 4-8%
- Premium Brands: 8-12%

**URL Structure:**
```
Original: https://www.myntra.com/foundation/maybelline/product-id
Affiliate: Via network tracking URL
```

---

## 🔧 Implementation Strategy

### Option A: Manual Approach (Start Here)

**For immediate testing:**

1. **Pick 10-20 Top Products**
   - Focus on bestsellers
   - Get real URLs manually

2. **Amazon First (Easiest)**
   - Sign up for Amazon Associates
   - Get approved (usually fast)
   - Use SiteStripe to get affiliate links
   - Update database

3. **Create Test Products**
   ```javascript
   // Example real product
   {
     name: "Maybelline Fit Me Matte+Poreless Foundation",
     brand: "MAYBELLINE",
     prices: [
       {
         platform: "Amazon",
         amount: 399, // Update with real-time scraping
         url: "https://www.amazon.in/Maybelline-Matte-Poreless-Foundation/dp/B071VKJKVC?tag=beautynomy-21"
       }
     ]
   }
   ```

### Option B: Automated Approach (Long-term)

**After getting approved:**

1. **Use Affiliate Network APIs**
   - Most networks provide APIs
   - Auto-generate affiliate links
   - Track conversions

2. **Deep Linking**
   - Convert any product URL to affiliate link
   - Amazon, Flipkart provide this

3. **Price Scraping + Affiliate Wrapping**
   - Your scrapers get real products
   - Wrap URLs with affiliate tracking
   - Store in database

---

## 📝 Action Plan for You

### Week 1: Sign-Ups
- [ ] Amazon Associates (Priority 1 - Fastest approval)
- [ ] Flipkart Affiliate (Priority 2)
- [ ] Join Admitad network (for Nykaa, Myntra, Purplle)

### Week 2: While Waiting for Approvals
- [ ] Research top 50 beauty products in India
- [ ] Manually collect product URLs from each platform
- [ ] Create spreadsheet with product URLs
- [ ] Test price scraping on real URLs

### Week 3: Implementation
- [ ] Update database with real Amazon URLs (once approved)
- [ ] Test affiliate tracking with Amazon
- [ ] Add other platforms as approvals come in

### Week 4: Automation
- [ ] Create script to wrap URLs with affiliate codes
- [ ] Set up affiliate conversion tracking
- [ ] Test full purchase flow

---

## 🛠️ Helper Scripts I Can Create for You

### 1. URL Validator
Checks if product URLs are valid and returns prices

### 2. Affiliate Link Generator
Takes normal URL → Returns affiliate URL

### 3. Database Update Script
Updates all products with real URLs

### 4. Price Checker
Scrapes real prices from actual product pages

---

## 💰 Expected Revenue

With 204 products and affiliate tracking:

**Scenario: 1000 visitors/month**
- Conversion rate: 2% (20 sales)
- Average order: ₹1000
- Commission: 7% average
- **Monthly revenue: ₹1400**

**Scenario: 10,000 visitors/month**
- Conversion rate: 2% (200 sales)
- Average order: ₹1000
- **Monthly revenue: ₹14,000**

---

## ⚠️ Important Notes

1. **Disclose Affiliate Relationships**
   - Required by law in India
   - Add disclosure on your site (you already have this!)

2. **Track Conversions**
   - Each platform provides dashboard
   - Monitor which products sell best

3. **Cookie Duration**
   - Amazon: 24 hours
   - Flipkart: 24 hours
   - Nykaa: 7-30 days (varies)

4. **Payment Terms**
   - Amazon: 60 days after month end
   - Flipkart: 60-90 days
   - Others: Varies

5. **Minimum Payout**
   - Usually ₹1000-₹5000
   - Check each platform

---

## 🚀 Quick Start: Get 1 Working Product

**Let's test with Amazon (easiest to get approved):**

1. Sign up: https://affiliate.amazon.in/
2. Get approved (1-3 days)
3. Search "Maybelline Fit Me Foundation"
4. Use SiteStripe → Get link
5. Test: Click your link → Should track!

**Example Working Product:**
```javascript
{
  name: "Maybelline Fit Me Matte+Poreless Foundation - Natural Beige 220",
  brand: "MAYBELLINE",
  category: "Foundation",
  image: "https://m.media-amazon.com/images/I/51xYZ.jpg", // Real Amazon image
  description: "Lightweight foundation that matches skin tone...",
  prices: [
    {
      platform: "Amazon",
      amount: 399, // Real scraped price
      url: "https://www.amazon.in/dp/B071VKJKVC?tag=beautynomy-21", // Real affiliate link
      rating: 4.1,
      reviews: 12847
    }
  ]
}
```

---

## 📞 Need Help?

Once you get your affiliate IDs, I can:
1. Create automated link wrapper functions
2. Build database update script
3. Set up price scraping for real URLs
4. Add conversion tracking

**Next Steps:**
1. Start with Amazon signup (takes 5 minutes)
2. Share your affiliate tag when approved
3. I'll help integrate it into the system!

---

## 📚 Resources

- Amazon Associates Help: https://affiliate.amazon.in/help
- Flipkart Affiliate Guide: https://affiliate.flipkart.com/help
- Admitad Network: https://www.admitad.com/en/webmaster/
- Affiliate Marketing in India: Legal guidelines

---

**Status:** Ready to implement once you have affiliate accounts!

**Priority:** Start with Amazon → Flipkart → Others
