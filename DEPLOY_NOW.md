# ⚠️ URGENT: Deploy Required!

## Current Status

❌ **The live site still has the old code with errors**

The hreflang checker shows:
- ❌ Source: **header** (with wrong format `sa-ar`, `kw-en`)  
- ✅ Source: **html** (with correct format `ar-SA`, `en-KW`)

This means **the fixes are NOT deployed yet!**

---

## What Needs to Be Done

### 1. Build the Application
```bash
npm run build
```

### 2. Restart the Server
```bash
# If using PM2
pm2 restart monsbah

# OR if using npm
npm run start
```

### 3. Clear CDN Cache (if applicable)
If you're using CloudFlare, AWS CloudFront, or any CDN:
- Go to your CDN dashboard
- Clear/purge the cache for your domain
- Wait 5-10 minutes for the cache to clear

---

## Files That Need to Be Deployed

1. ✅ `src/utils/hreflang.js` (already modified)
2. ✅ `src/middleware.js` (already modified)

---

## Quick Verification After Deploy

### Test 1: Check HTTP Headers (Should be empty)
```bash
curl -I https://monsbah.com/kw-ar/ | grep -i "link:"
```
**Expected:** No output (no Link headers)

### Test 2: Check HTML (Should have ar-KW format)
```bash
curl -s https://monsbah.com/kw-ar/ | grep 'hreflang=' | head -5
```
**Expected:** Lines like `hreflang="ar-KW"`, `hreflang="en-SA"`

---

## Why This Is Happening

The checker is seeing **both sources** because:
1. ✅ Your code changes are correct (we can see `ar-KW` in HTML)
2. ❌ But the server is still running old code (sending `sa-ar` in headers)
3. ❌ The middleware that removes headers hasn't been deployed yet

---

## Deployment Commands

### For PM2 (Most Common)
```bash
cd /Users/ahmed/Desktop/Front/Freelance/monsbah-next
npm run build
pm2 restart monsbah
pm2 logs monsbah --lines 50  # Check for errors
```

### For Production Server (if different)
```bash
# SSH to your server
ssh user@your-server

# Navigate to project
cd /path/to/monsbah-next

# Pull latest changes (if using git)
git pull origin master

# Install dependencies (if needed)
npm install

# Build
npm run build

# Restart
pm2 restart monsbah
# OR
npm run start
```

---

## After Deployment

Wait 2-3 minutes, then test again:

```bash
# Should return NOTHING
curl -I https://monsbah.com/kw-ar/ | grep -i "link:"

# Should show ar-KW format
curl -s https://monsbah.com/kw-ar/ | grep 'hreflang="ar-KW"'
```

Then re-run: https://hreflangchecker.com/report

**Expected Result:** Only HTML source, no header source ✅

---

## Important Notes

⚠️ **The code changes are correct!**  
⚠️ **You just need to deploy them!**  
⚠️ **The checker showing both sources proves the changes aren't live yet**

---

## Need Help?

If you're not sure how to deploy:
1. Check your `package.json` for scripts
2. Look for `ecosystem.config.js` (PM2 config)
3. Check your deployment documentation
4. Run `pm2 list` to see running processes

---

**Status:** ⏳ Waiting for Deployment  
**Action Required:** Deploy the code changes to production
