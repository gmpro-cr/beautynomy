# Cuelinks Quick Start Guide

Get Cuelinks running in Beautynomy in under 5 minutes!

## Step 1: Get Your Cuelinks Credentials (2 mins)

1. Go to **[Cuelinks.com](https://www.cuelinks.com)**
2. Click **"Sign Up"** (free for publishers)
3. Complete registration with your details
4. Verify your email
5. Once logged in, go to **Settings → API Integration**
6. Copy these two values:
   - **API Key** (32-character string)
   - **Publisher ID** (numeric ID)

## Step 2: Add Credentials to Environment (1 min)

Open `Beautynomy/server/.env` and add:

```env
CUELINKS_API_KEY=paste_your_32_character_key_here
CUELINKS_PUBLISHER_ID=paste_your_publisher_id_here
```

**Example:**
```env
CUELINKS_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
CUELINKS_PUBLISHER_ID=123456
```

## Step 3: Test the Integration (2 mins)

### Start the server:
```bash
cd Beautynomy/server
npm start
```

### Run the test script:
```bash
# In a new terminal
cd Beautynomy/server
node test-cuelinks.js
```

You should see:
```
✅ Cuelinks is properly configured
✅ Deeplink generated successfully
✅ Successfully converted URLs
🎉 All tests passed!
```

## Step 4: Verify It's Working

### Test the API endpoints:

**1. Check Status:**
```bash
curl http://localhost:5000/api/cuelinks/status
```

**2. Generate a Test Deeplink:**
```bash
curl -X POST http://localhost:5000/api/cuelinks/deeplink \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.nykaa.com", "subId": "test"}'
```

**3. Scrape a Product (Auto-Converts URLs):**
```bash
curl -X POST http://localhost:5000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"productName": "Maybelline lipstick"}'
```

Check the response - URLs should be Cuelinks shortened links!

## That's It! 🎉

Cuelinks is now integrated and will automatically:
- ✅ Convert all product URLs to trackable affiliate links
- ✅ Track clicks and conversions
- ✅ Handle commission tracking

## Next Steps

### View Your Earnings
1. Log into [Cuelinks Dashboard](https://www.cuelinks.com/login)
2. Go to **Reports → Earnings**
3. See your clicks, conversions, and commissions!

### Track Performance
- Filter by SubID to see which products perform best
- Analyze which platforms drive more sales
- Optimize based on data

## Troubleshooting

### "Cuelinks not configured" error?
- Double-check your `.env` file has both variables
- Restart the server after adding credentials
- Make sure API key is exactly 32 characters

### URLs not converting?
- Check test script output for errors
- Verify your Cuelinks account is active
- Check for API rate limits in Cuelinks dashboard

### Need Help?
- Check the full guide: `CUELINKS-INTEGRATION-GUIDE.md`
- View server logs for detailed errors
- Contact Cuelinks support: support@cuelinks.com

## Pro Tips

### 1. Use SubID Tracking
SubIDs are automatically set as `{platform}-{productId}`. View them in Cuelinks Reports to see:
- Which products convert best
- Which platforms users prefer
- Which categories are most profitable

### 2. Monitor the Dashboard
Check your Cuelinks dashboard weekly to:
- See total earnings
- Identify top-performing products
- Catch any issues early

### 3. Test Before Production
Always run `node test-cuelinks.js` after:
- Updating credentials
- Deploying to new environment
- Making changes to Cuelinks service

---

**Happy Earning! 💰**

For detailed documentation, see: `CUELINKS-INTEGRATION-GUIDE.md`
