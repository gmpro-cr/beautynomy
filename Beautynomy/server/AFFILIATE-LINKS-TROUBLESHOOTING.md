# Affiliate Links Troubleshooting Guide

## Issue: Links Not Working / API Timeout

### Problem: Render Free Tier Service Sleeping

**What's Happening:**
- Your API on Render free tier sleeps after 15 minutes of inactivity
- When someone visits your website, the API takes 50+ seconds to wake up
- This causes errors, timeouts, and broken links

**Visual Symptoms:**
- Website shows "Loading..." for a long time
- Products don't appear
- "Network Error" or similar messages
- Affiliate links appear broken

---

## Quick Fix: Wake Up the Service

**Option 1: Manual Wake-Up (Test Now)**

1. Open this URL in your browser and wait 1-2 minutes:
   ```
   https://beautynomy-api.onrender.com/
   ```

2. Once it shows "Beautynomy API" response, your API is awake

3. Now visit your website:
   ```
   https://www.beatynomy.in
   ```

4. Products should load and affiliate links should work!

**Option 2: Auto Keep-Alive Script (Best for Development)**

Run this command on your computer to keep the API awake:

```bash
cd /Users/gaurav/Beautynomy/server
node scripts/keep-alive-pinger.js
```

This will ping your API every 14 minutes to prevent it from sleeping.

**Keep this running in a terminal while you're working on your site!**

---

## Long-Term Solutions

### Solution 1: Use UptimeRobot (FREE & Recommended)

**Steps:**
1. Go to: https://uptimerobot.com/
2. Sign up for free account
3. Add a new monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Beautynomy API
   - **URL**: `https://beautynomy-api.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes (free tier)

4. Save!

**Result**: Your API will never sleep! UptimeRobot will ping it every 5 minutes.

### Solution 2: Use Cron-Job.org (FREE)

**Steps:**
1. Go to: https://cron-job.org/
2. Sign up for free account
3. Create a new cron job:
   - **Title**: Keep Beautynomy Awake
   - **URL**: `https://beautynomy-api.onrender.com/api/health`
   - **Schedule**: Every 14 minutes

4. Enable and save!

### Solution 3: Upgrade Render (PAID)

**Option**: Upgrade to Render's paid tier ($7/month)
- Service never sleeps
- Faster performance
- More reliable
- Better for production

---

## How to Verify Affiliate Links Are Working

### Test 1: Check API Response

```bash
curl "https://beautynomy-api.onrender.com/api/products?query=kajal"
```

**Look for:**
```json
{
  "prices": [
    {
      "platform": "Amazon",
      "url": "https://www.amazon.in/...?tag=beautynomy25-21"
    }
  ]
}
```

**✅ If you see `?tag=beautynomy25-21` in URLs, affiliate tracking is working!**

### Test 2: Check on Website

1. Go to https://www.beatynomy.in
2. Search for "Lakme Kajal"
3. Click "Compare Prices"
4. Click any Amazon price button
5. Check the URL in your browser - should have `?tag=beautynomy25-21`

### Test 3: Check in Browser DevTools

1. Open https://www.beatynomy.in
2. Press F12 (open DevTools)
3. Go to "Network" tab
4. Refresh the page
5. Look for request to `beautynomy-api.onrender.com`
6. Check the response - should show products with affiliate URLs

---

## Common Errors & Fixes

### Error: "Failed to fetch"
**Cause**: API is sleeping
**Fix**: Wait 1-2 minutes for API to wake up, then refresh

### Error: "Network request failed"
**Cause**: API timeout
**Fix**: Increase timeout or keep API awake with UptimeRobot

### Error: Links missing `?tag=beautynomy25-21`
**Cause**: Affiliate generator not running
**Fix**: Check `server/utils/affiliate-link-generator.js` - ensure `enabled: true` for Amazon

### Error: Products not loading
**Cause**: API sleeping or database connection lost
**Fix**:
1. Wake up API manually
2. Check MongoDB connection is active
3. Check Render logs for errors

---

## How to Check Render Status

### Method 1: Dashboard

1. Go to: https://dashboard.render.com/
2. Find "beautynomy-api" service
3. Check status:
   - **Green dot** = Running
   - **Gray dot** = Sleeping
   - **Red dot** = Error

### Method 2: API Direct

```bash
curl https://beautynomy-api.onrender.com/
```

**If it responds** = API is awake
**If it times out** = API is sleeping (wait 50+ seconds)

---

## Monitoring Your Affiliate Links

### Daily Checks:

1. **Visit your website**: https://www.beatynomy.in
2. **Test a product link**: Click Amazon price
3. **Verify URL**: Should see `?tag=beautynomy25-21`
4. **Check Associates Dashboard**: https://affiliate.amazon.in/
   - Look for clicks (24 hours delay)
   - Look for orders (2-3 days delay)

### Weekly Checks:

1. **Test all categories**: Foundation, Kajal, Lipstick, etc.
2. **Check API health**: Visit API URL directly
3. **Review earnings**: Check Amazon Associates reports
4. **Add new products**: Keep catalog fresh

---

## Quick Summary

**Problem**: Render free tier sleeps → API doesn't respond → Links appear broken

**Immediate Fix**:
1. Visit `https://beautynomy-api.onrender.com/` and wait 1-2 minutes
2. Then visit your website

**Permanent Fix**:
1. Sign up for UptimeRobot (free): https://uptimerobot.com/
2. Add monitor for your API
3. Never worry about sleeping again!

**Verify Links Work**:
1. Visit https://www.beatynomy.in
2. Click any Amazon price
3. Check URL has `?tag=beautynomy25-21`

---

## Need Help?

**If affiliate links still don't work after following this guide:**

1. Check if API is awake: https://beautynomy-api.onrender.com/
2. Check database has products: Run the cleanup script again
3. Check frontend is deployed: https://www.beatynomy.in should show products
4. Check browser console (F12) for errors

**Your affiliate tracking is configured correctly!**
The issue is just the Render free tier sleeping behavior.

Once you set up UptimeRobot, everything will work perfectly! 🎉
