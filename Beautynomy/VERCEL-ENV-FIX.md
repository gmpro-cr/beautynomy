# Fix Vercel Environment Variable - Products Not Loading

## Issue
Products are not loading on beautynomy.vercel.app because the `VITE_API_URL` environment variable is not configured in Vercel.

**Current Error:**
```
Access to XMLHttpRequest at 'https://your-backend-url.onrender.com/api/products?query=all'
```

**Backend Status:** ✅ Running at `https://beautynomy-api.onrender.com` with 214 products

## Quick Fix (2 minutes)

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find your project (beautynomy)

2. **Navigate to Project Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Environment Variable**
   - Variable Name: `VITE_API_URL`
   - Value: `https://beautynomy-api.onrender.com`
   - Select environments: **Production**, **Preview**, **Development** (check all)
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click the ⋯ menu on the latest deployment
   - Click **Redeploy**
   - Wait ~2 minutes for deployment to complete

5. **Verify**
   - Visit https://beautynomy.vercel.app
   - Products should now load correctly

### Option 2: Vercel CLI (Alternative)

If you prefer using CLI:

```bash
# Login to Vercel
vercel login

# Link project (if not already linked)
cd /Users/gaurav/Beautynomy
vercel link

# Add environment variable
echo "https://beautynomy-api.onrender.com" | vercel env add VITE_API_URL production
echo "https://beautynomy-api.onrender.com" | vercel env add VITE_API_URL preview

# Trigger new deployment
cd client
vercel --prod
```

## Why This Happened

1. `.env` files are not committed to Git (they're in `.gitignore` for security)
2. Vercel builds from Git, so it doesn't have access to your local `.env` file
3. Environment variables must be configured in Vercel's dashboard or CLI
4. The code has a fallback URL, but the build process needs the variable at build time

## Verification

After setting the environment variable and redeploying:

1. **Check API Response**
   ```bash
   curl https://beautynomy-api.onrender.com/api/products?query=all
   ```
   Should return JSON with products

2. **Check Frontend**
   - Visit https://beautynomy.vercel.app
   - Open browser DevTools (F12)
   - Check Console - should NOT see "your-backend-url" error
   - Products should be visible on the page

## Backend Status

✅ Backend API: https://beautynomy-api.onrender.com
- Status: Running
- Database: MongoDB
- Products: 214
- Platforms: 5 (Nykaa, Amazon, Flipkart, Purplle, Myntra)
- Affiliate links: ✅ All configured

## Need Help?

If products still don't load after following these steps:

1. Check browser console for errors (F12 → Console tab)
2. Verify the API URL in Vercel environment variables
3. Ensure the deployment completed successfully
4. Clear browser cache and try again

---

**Created:** 2025-10-14
**Backend URL:** `https://beautynomy-api.onrender.com`
**Frontend URL:** `https://beautynomy.vercel.app`
