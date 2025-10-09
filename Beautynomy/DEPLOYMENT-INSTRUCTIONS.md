# Beautynomy Deployment Instructions

## Quick Deploy Guide

### Backend (Render)

1. **Push to GitHub** (already done)
2. **Go to Render**: https://render.com
3. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the `Beautynomy/server` directory
   - Settings:
     - **Name**: beautynomy-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
4. **Deploy** and copy your API URL (e.g., `https://beautynomy-api.onrender.com`)

### Frontend (Vercel)

1. **Go to Vercel**: https://vercel.com
2. **Import Project** from GitHub
3. **Configure**:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://beautynomy-api.onrender.com` (your Render URL)
5. **Deploy**

## Important Notes

- Backend runs on port 3000
- Frontend expects API at `VITE_API_URL` environment variable
- First load on Render free tier may take 30-50 seconds (cold start)
- Both deployments auto-update when you push to GitHub

## Testing After Deployment

1. Visit your Vercel URL (e.g., `https://beautynomy.vercel.app`)
2. Check that products load
3. Test search, filters, wishlist, and compare features

## Local Development

### Server
```bash
cd server
npm install
npm start
# Runs on http://localhost:3000
```

### Client
```bash
cd client
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
# Runs on http://localhost:5173
```

## Troubleshooting

**Products not loading?**
- Check that VITE_API_URL is set correctly in Vercel
- Verify backend is running on Render
- Check browser console for errors

**Render deployment failing?**
- Ensure `package.json` has `"type": "module"`
- Check build logs on Render dashboard

**Vercel build failing?**
- Verify all dependencies are in `package.json`
- Check build logs on Vercel dashboard
