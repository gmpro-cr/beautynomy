# Render Deployment Troubleshooting Guide

## Current Repository Structure (Confirmed)

```
beautynomy/ (GitHub repo root)
├── server/
│   ├── server.js
│   ├── package.json
│   └── render.yaml
├── client/
│   └── (frontend files)
└── render.yaml (Blueprint configuration)
```

---

## Deployment Methods

### Method 1: Manual Web Service (RECOMMENDED - Most Reliable)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Web Service"**
3. **Connect GitHub** repository: `gmpro-cr/beautynomy`
4. **Important Settings**:

   | Setting | Exact Value |
   |---------|-------------|
   | Name | `beautynomy-api` |
   | Root Directory | `server` |
   | Environment | `Node` |
   | Region | `Oregon (US West)` |
   | Branch | `main` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | `Free` |

5. **Environment Variables**: Leave empty or add:
   ```
   NODE_ENV = production
   ```

6. **Click "Create Web Service"**

---

## Common Errors & Solutions

### Error 1: "Service Root Directory '/opt/render/project/src/server' is missing"

**Cause**: Wrong root directory path

**Solutions**:
- ✅ Set Root Directory to: `server` (exactly, no quotes)
- ❌ NOT: `Beautynomy/server`
- ❌ NOT: `/server`
- ❌ NOT: `./server`

---

### Error 2: "Failed to install dependencies"

**Cause**: npm install fails

**Solution**: Check build logs for specific npm error. Common fixes:
- Ensure `package.json` exists in `server/` directory
- Check Node version (we require >=18.0.0)
- Run `npm install` locally first to verify

---

### Error 3: "Error: Cannot find module 'express'"

**Cause**: ES modules issue or dependencies not installed

**Solution**:
- Verify `package.json` has `"type": "module"`
- Ensure build command is `npm install` not `npm ci`

---

### Error 4: "Application failed to respond"

**Cause**: Server not starting properly

**Solutions**:
- Check that server uses `process.env.PORT` (we do: line 5 in server.js)
- Verify start command is `npm start`
- Check logs for actual error

---

### Error 5: "Build failed"

**Cause**: Various build issues

**Solution**: Share the exact build log error. Look for:
```
npm ERR!
```
or
```
Error:
```

---

## Manual Verification Steps

### 1. Verify Files are on GitHub

Check: https://github.com/gmpro-cr/beautynomy/tree/main/server

You should see:
- ✅ server.js
- ✅ package.json
- ✅ package-lock.json

### 2. Verify package.json Content

```json
{
  "name": "beautynomy-server",
  "version": "2.0.0",
  "type": "module",          ← MUST BE PRESENT
  "main": "server.js",
  "scripts": {
    "start": "node server.js" ← MUST BE PRESENT
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

### 3. Test Locally First

```bash
cd /Users/gaurav/Beautynomy/server
npm install
npm start
```

Should show:
```
🚀 Beautynomy API running on port 3000
📦 Loaded 30 products
```

Then test: http://localhost:3000

---

## Alternative: Deploy Without render.yaml

If Blueprint isn't working:

1. **Delete the deployment** if you created one
2. **Use Manual Web Service** method above
3. **Ignore render.yaml** completely
4. **Manually enter all settings** in Render UI

---

## Get Detailed Error Logs

In Render Dashboard:
1. Click on your service
2. Go to "Logs" tab
3. Look for errors in:
   - **Build Logs** (during npm install)
   - **Deploy Logs** (during startup)
4. Copy the EXACT error message

---

## Expected Successful Deployment

When it works, you'll see:

**Build Log:**
```
==> Installing dependencies...
npm install
added 71 packages
==> Build succeeded 🎉
```

**Deploy Log:**
```
==> Starting service...
🚀 Beautynomy API running on port 10000
📦 Loaded 30 products
Your service is live 🎉
```

Then your API URL will be active: `https://beautynomy-api.onrender.com`

---

## What to Share for Debugging

If still facing issues, share:

1. **Screenshot** of Render service settings page
2. **Full build logs** (copy all text from Build Logs)
3. **Full deploy logs** (copy all text from Deploy Logs)
4. **Exact error message** (the red error text)

---

## Quick Checklist

Before deploying, verify:

- [ ] GitHub repo is public or Render has access
- [ ] `server/package.json` exists and has `"type": "module"`
- [ ] `server/server.js` exists
- [ ] Root Directory is set to `server` (not `Beautynomy/server`)
- [ ] Build Command is `npm install`
- [ ] Start Command is `npm start`
- [ ] Branch is `main`

---

## Still Not Working?

Try this debug deployment:

1. Create a new service
2. Use these EXACT settings:
   - Repository: `gmpro-cr/beautynomy`
   - Root Dir: `server`
   - Build: `npm install`
   - Start: `npm start`
3. Screenshot the error and share

---

Last Updated: October 10, 2025
