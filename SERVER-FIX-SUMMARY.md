# Server Deployment - 400 Error Fix Summary

## 🎯 Problem Identified
You're getting `400 Bad Request` errors for Next.js chunk files with encoded brackets in the URL:
```
/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js
```

## ✅ Solutions Implemented

### 1. Updated Configuration Files

#### next.config.mjs
Added production optimizations:
- Standalone output mode
- Cache headers for static assets
- Compression enabled

#### Server Configurations Created
- **nginx.conf** - Complete Nginx configuration with proper static file handling
- **apache.conf** - Complete Apache configuration with `AllowEncodedSlashes` fix
- **ecosystem.config.js** - PM2 process manager configuration

### 2. Deployment Tools Created

#### deploy.sh
Automated deployment script that:
- Builds the application locally
- Creates a deployment package
- Uploads to server
- Installs dependencies
- Restarts the application
- Verifies deployment

**Usage:**
```bash
# Update server details in deploy.sh first
./deploy.sh
```

### 3. Documentation Created

| File | Purpose |
|------|---------|
| **DEPLOYMENT-GUIDE.md** | Complete step-by-step deployment guide |
| **QUICK-FIX.md** | Immediate actions to fix the 400 error |
| **TROUBLESHOOTING-CHECKLIST.md** | Detailed checklist for diagnosing issues |
| **BUILD-FIXES.md** | Documentation of build errors fixed |

## 🚀 Quick Start Guide

### Option 1: Manual Deployment (Recommended First Time)

1. **Read the guides:**
   ```bash
   cat QUICK-FIX.md        # Start here for immediate fix
   cat DEPLOYMENT-GUIDE.md # Full deployment instructions
   ```

2. **Build locally:**
   ```bash
   npm run build
   ```

3. **Upload files to server:**
   ```bash
   # Update these values
   SERVER="your-user@your-server"
   PATH="/var/www/monsbah"
   
   rsync -avz --exclude 'node_modules' \
     .next/ public/ package.json package-lock.json next.config.mjs \
     $SERVER:$PATH/
   ```

4. **Configure web server:**
   - For Nginx: Use `nginx.conf`
   - For Apache: Use `apache.conf`
   
   See DEPLOYMENT-GUIDE.md for details.

5. **Start application:**
   ```bash
   ssh your-server
   cd /var/www/monsbah
   npm ci --omit=dev
   pm2 start ecosystem.config.js
   ```

### Option 2: Automated Deployment

1. **Update deploy.sh:**
   ```bash
   # Edit these lines in deploy.sh
   SERVER_USER="your-username"
   SERVER_HOST="your-server-ip"
   SERVER_PATH="/var/www/monsbah"
   ```

2. **Run deployment:**
   ```bash
   ./deploy.sh
   ```

## 🔍 Root Cause Analysis

### Why This Happens
1. **URL Encoding:** Next.js dynamic routes `[country-locale]` become `%5Bcountry-locale%5D` in URLs
2. **Server Restrictions:** Web servers (Apache/Nginx) block encoded slashes by default for security
3. **Static Files:** The `.next/static` files must be served directly, not proxied through Next.js

### The Fix
1. **Apache:** Add `AllowEncodedSlashes NoDecode`
2. **Nginx:** Add specific location blocks for `/_next/static`
3. **Ensure:** `.next` folder is deployed and accessible

## 📋 Verification Steps

After deployment, verify these:

1. **Build Success:**
   ```bash
   npm run build  # Should complete without errors
   ```

2. **Files Deployed:**
   ```bash
   ssh your-server "ls -la /var/www/monsbah/.next/static/chunks/"
   ```

3. **App Running:**
   ```bash
   ssh your-server "pm2 status"
   ```

4. **Static Files Accessible:**
   ```bash
   curl -I https://monsbah.com/_next/static/chunks/main-app-xxx.js
   # Should return 200 OK
   ```

5. **Encoded URLs Work:**
   ```bash
   curl -I "https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js"
   # Should return 200 OK, not 400
   ```

6. **Browser Test:**
   - Open https://monsbah.com
   - Open DevTools (F12)
   - Check Console - No errors
   - Check Network - All requests return 200

## 🆘 If You're Still Getting 400 Errors

Follow these in order:

1. **Check QUICK-FIX.md** for immediate solutions
2. **Use TROUBLESHOOTING-CHECKLIST.md** to systematically diagnose
3. **Review server logs:**
   ```bash
   sudo tail -50 /var/log/nginx/error.log  # or apache2
   pm2 logs monsbah
   ```

## 📁 File Structure on Server

Your server should have this structure:
```
/var/www/monsbah/
├── .next/
│   ├── static/
│   │   ├── chunks/
│   │   │   ├── app/
│   │   │   │   └── [country-locale]/  ← These files return 400
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── public/
├── node_modules/
├── package.json
├── package-lock.json
├── next.config.mjs
└── ecosystem.config.js
```

## 🎯 Critical Points

### Must-Have Configurations

**For Nginx:**
```nginx
location /_next/static {
    alias /var/www/monsbah/.next/static;
}
```

**For Apache:**
```apache
AllowEncodedSlashes NoDecode
ProxyPass /_next/static !
```

### Must-Deploy Files
- [ ] Entire `.next` folder
- [ ] `public` folder
- [ ] `package.json` and `package-lock.json`
- [ ] `next.config.mjs`

### Must-Check Items
- [ ] Permissions: `chown -R www-data:www-data /var/www/monsbah`
- [ ] Next.js running: `pm2 status`
- [ ] Port 3000 listening: `netstat -tlnp | grep 3000`

## 📞 Support Resources

### Logs to Check
```bash
# Nginx
sudo tail -f /var/log/nginx/error.log

# Apache
sudo tail -f /var/log/apache2/error.log

# PM2
pm2 logs monsbah

# Next.js
cat /var/www/monsbah/logs/pm2-error.log
```

### Commands to Test
```bash
# Test Next.js directly
curl http://localhost:3000

# Test through web server
curl https://monsbah.com

# Test static file
curl -I https://monsbah.com/_next/static/chunks/main-app-xxx.js

# Test with encoding
curl -I "https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js"
```

## 🎉 Success Criteria

You'll know it's working when:
- ✅ No 400 errors in browser console
- ✅ All pages load correctly
- ✅ All locales work (sa-ar, kw-en, etc.)
- ✅ Static files return 200 status
- ✅ No chunk loading errors
- ✅ Fast page transitions

## 📚 Next Steps After Fix

1. **Set up automatic deployments** (GitHub Actions, etc.)
2. **Configure monitoring** (PM2 monitoring, error tracking)
3. **Set up backups** (database, files)
4. **Optimize performance** (CDN, caching)
5. **SSL certificate renewal** (Let's Encrypt auto-renewal)

---

## File Guide

| File | When to Use |
|------|-------------|
| **QUICK-FIX.md** | When you need to fix the 400 error right now |
| **DEPLOYMENT-GUIDE.md** | When deploying from scratch or need detailed steps |
| **TROUBLESHOOTING-CHECKLIST.md** | When debugging deployment issues |
| **nginx.conf** | If your server uses Nginx |
| **apache.conf** | If your server uses Apache |
| **ecosystem.config.js** | For PM2 process management |
| **deploy.sh** | For automated deployments |

---

**Created:** $(date)
**Next.js Version:** 15.5.2
**Status:** Ready for deployment

**Start Here:** Open `QUICK-FIX.md` for immediate solutions!
