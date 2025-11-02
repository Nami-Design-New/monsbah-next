# 🚀 Exact Deployment Steps for Monsbah

## Current Situation
✅ Code is fixed locally  
❌ Code is NOT deployed to production  
⚠️ Hreflang checker still shows old errors because server is running old code

---

## Deployment Steps

### Step 1: Build the Application
```bash
cd /Users/ahmed/Desktop/Front/Freelance/monsbah-next
npm run build
```

**What this does:** Compiles your Next.js app with the new fixes

---

### Step 2: Check if PM2 is Running Locally or on Server

#### If deploying to LOCAL (development):
```bash
# Check what's running
pm2 list

# Restart monsbah
pm2 restart monsbah

# Check logs for errors
pm2 logs monsbah --lines 50
```

#### If deploying to REMOTE SERVER:
```bash
# SSH to your server
ssh user@your-production-server

# Navigate to project directory
cd /var/www/monsbah

# Pull latest changes (if using git)
git pull origin master

# Or if you need to upload files manually
# Use: scp -r /Users/ahmed/Desktop/Front/Freelance/monsbah-next/* user@server:/var/www/monsbah/

# Install dependencies
npm install

# Build on server
npm run build

# Restart PM2
pm2 restart monsbah

# Check logs
pm2 logs monsbah --lines 50
```

---

### Step 3: Verify Deployment

#### Test 1: Check No HTTP Link Headers
```bash
curl -I https://monsbah.com/kw-ar/ | grep -i "link:"
```
**Expected:** *(empty - no output)*

#### Test 2: Check HTML Has Correct Format
```bash
curl -s https://monsbah.com/kw-ar/ | grep 'hreflang=' | head -3
```
**Expected:**
```html
<link rel="alternate" href="https://monsbah.com/kw-ar/" hreflang="ar-KW" />
<link rel="alternate" href="https://monsbah.com/kw-en/" hreflang="en-KW" />
<link rel="alternate" href="https://monsbah.com/sa-ar/" hreflang="ar-SA" />
```

---

### Step 4: Re-test with Hreflang Checker

1. Go to: https://hreflangchecker.com/report
2. Enter: `https://monsbah.com/kw-ar/`
3. Click "Audit"

**Expected Results:**
- ❌ No "Source: header" entries
- ✅ Only "Source: html" entries
- ✅ All hreflang codes like `ar-KW`, `en-SA` (not `kw-ar`, `sa-en`)
- ✅ No "Multiple x-default" warning
- ✅ No ISO code errors

---

## If You're Using Git

### Option A: Commit and Push
```bash
cd /Users/ahmed/Desktop/Front/Freelance/monsbah-next

# Check what changed
git status

# Add the changed files
git add src/utils/hreflang.js src/middleware.js

# Commit
git commit -m "Fix hreflang: uppercase country codes, remove HTTP headers"

# Push to your repository
git push origin master

# Then on server: git pull origin master
```

### Option B: Direct File Upload
If you can't use git, copy these 2 files to the server:
1. `src/utils/hreflang.js`
2. `src/middleware.js`

---

## Common Issues

### Issue 1: "Module not found" Error
```bash
# Solution: Install dependencies
npm install
```

### Issue 2: Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use PM2 to restart
pm2 restart monsbah
```

### Issue 3: Changes Not Showing
```bash
# Clear Next.js cache
rm -rf .next
npm run build
pm2 restart monsbah

# Also clear CDN cache if you use one
```

### Issue 4: PM2 Not Found
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 restart monsbah
```

---

## Quick Deploy Script

Create this file as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Monsbah Hreflang Fixes..."

# Build
echo "📦 Building..."
npm run build

# Restart PM2
echo "♻️  Restarting server..."
pm2 restart monsbah

# Wait a bit
sleep 3

# Test
echo "🧪 Testing..."
echo "Checking for HTTP Link headers (should be empty):"
curl -I https://monsbah.com/kw-ar/ 2>/dev/null | grep -i "link:" || echo "✅ No Link headers found!"

echo ""
echo "Checking HTML hreflang format:"
curl -s https://monsbah.com/kw-ar/ 2>/dev/null | grep 'hreflang="ar-KW"' && echo "✅ Correct format found!" || echo "❌ Still showing old format"

echo ""
echo "✅ Deployment complete!"
echo "➡️  Now test at: https://hreflangchecker.com/report"
```

Make it executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Verification Checklist

After deployment, verify:

- [ ] `curl -I https://monsbah.com/kw-ar/ | grep -i "link:"` returns nothing
- [ ] `curl -s https://monsbah.com/kw-ar/ | grep 'hreflang="ar-KW"'` shows results
- [ ] Website loads correctly
- [ ] No errors in PM2 logs: `pm2 logs monsbah`
- [ ] Hreflang checker shows only HTML source
- [ ] All hreflang codes use uppercase (ar-KW, en-SA, etc.)

---

## Summary

**Your code is correct!** ✅  
**You just need to deploy it!** 🚀  

The hreflang checker showing both "header" and "html" sources proves the old code is still running on the server. Once you deploy, it will show only "html" source with the correct format.

---

**Next Action:** Run the deployment commands above and re-test!
