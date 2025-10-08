# 🚨 URGENT: Fix 400 Bad Request Error on Production Server

## The Problem You're Facing

Your Next.js app is deployed but you're seeing these errors in the browser console:

```
GET https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js 
net::ERR_ABORTED 400 (Bad Request)
```

**This means:** Your web server (Nginx/Apache) is blocking Next.js chunk files because of the `%5B` and `%5D` (encoded brackets) in the URL.

---

## 🎯 Quick Fix (5 Minutes)

### Step 1: Identify Your Web Server

```bash
# SSH into your server
ssh your-server

# Check which server you're using
ps aux | grep nginx
ps aux | grep apache
```

### Step 2: Apply the Fix

#### If Using Nginx:

1. Edit your nginx config:
```bash
sudo nano /etc/nginx/sites-available/monsbah.com
```

2. Add this inside the `server` block:
```nginx
location /_next/static {
    alias /var/www/monsbah/.next/static;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
}
```

3. Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### If Using Apache:

1. Edit your apache config:
```bash
sudo nano /etc/apache2/sites-available/monsbah.com.conf
```

2. Add this at the top of the `<VirtualHost>` block:
```apache
AllowEncodedSlashes NoDecode
ProxyPass /_next/static !
Alias /_next/static /var/www/monsbah/.next/static
```

3. Reload apache:
```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

### Step 3: Verify the Fix

```bash
# Test if static files work
curl -I "https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js"

# Should return: HTTP/2 200 (not 400)
```

---

## 📚 Complete Documentation

I've created comprehensive guides for you:

### Start Here:
1. **[SERVER-FIX-SUMMARY.md](./SERVER-FIX-SUMMARY.md)** - Overview of the problem and solutions
2. **[QUICK-FIX.md](./QUICK-FIX.md)** - Immediate actions to fix the 400 error

### Deployment Guides:
3. **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** - Step-by-step deployment from scratch
4. **[TROUBLESHOOTING-CHECKLIST.md](./TROUBLESHOOTING-CHECKLIST.md)** - Systematic debugging

### Configuration Files:
5. **[nginx.conf](./nginx.conf)** - Complete Nginx configuration
6. **[apache.conf](./apache.conf)** - Complete Apache configuration
7. **[ecosystem.config.js](./ecosystem.config.js)** - PM2 process manager config

### Automation:
8. **[deploy.sh](./deploy.sh)** - Automated deployment script

---

## 🆘 Common Issues

### Issue 1: Still Getting 400 Errors

**Check if files exist:**
```bash
ssh your-server
ls -la /var/www/monsbah/.next/static/chunks/
```

**If folder is empty:**
```bash
# Rebuild locally
npm run build

# Upload to server
rsync -avz .next/ your-server:/var/www/monsbah/.next/
```

### Issue 2: Getting 404 or 403 Instead

**Fix permissions:**
```bash
ssh your-server
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah
```

### Issue 3: 502 Bad Gateway

**Next.js isn't running:**
```bash
ssh your-server
pm2 status
pm2 restart monsbah
pm2 logs monsbah
```

---

## 🎯 What I've Done

1. ✅ **Updated next.config.mjs** with production optimizations
2. ✅ **Created nginx.conf** with proper static file handling
3. ✅ **Created apache.conf** with encoded slashes fix
4. ✅ **Created deployment script** for automated deployment
5. ✅ **Created 4 comprehensive guides** for different scenarios
6. ✅ **Documented all previous build fixes** in BUILD-FIXES.md

---

## 📖 Documentation Map

```
├── START HERE
│   ├── SERVER-FIX-SUMMARY.md    ← Read this first
│   └── QUICK-FIX.md             ← For urgent fix
│
├── DEPLOYMENT
│   ├── DEPLOYMENT-GUIDE.md      ← Full deployment guide
│   ├── deploy.sh                ← Automated deployment
│   └── ecosystem.config.js      ← PM2 configuration
│
├── SERVER CONFIG
│   ├── nginx.conf               ← For Nginx servers
│   ├── apache.conf              ← For Apache servers
│   └── next.config.mjs          ← Next.js config (updated)
│
├── DEBUGGING
│   └── TROUBLESHOOTING-CHECKLIST.md
│
└── BUILD HISTORY
    └── BUILD-FIXES.md           ← Previous build fixes
```

---

## 🚀 Deployment Workflow

### For First-Time Deployment:

```bash
# 1. Build locally
npm run build

# 2. Deploy files
rsync -avz --exclude 'node_modules' \
  .next/ public/ package.json package-lock.json next.config.mjs \
  your-server:/var/www/monsbah/

# 3. Install dependencies on server
ssh your-server "cd /var/www/monsbah && npm ci --omit=dev"

# 4. Configure web server (use nginx.conf or apache.conf)

# 5. Start application
ssh your-server "cd /var/www/monsbah && pm2 start ecosystem.config.js"

# 6. Test
curl https://monsbah.com
```

### For Updates:

```bash
# Option 1: Manual
npm run build
rsync -avz .next/ your-server:/var/www/monsbah/.next/
ssh your-server "pm2 restart monsbah"

# Option 2: Automated
./deploy.sh  # (after updating server details)
```

---

## ✅ Success Checklist

After fixing, verify ALL of these:

- [ ] Browser console shows no errors
- [ ] All pages load (https://monsbah.com/sa-ar, /kw-en, etc.)
- [ ] Network tab shows all files returning 200
- [ ] No chunk loading errors
- [ ] Page transitions work smoothly
- [ ] All locales work correctly

---

## 🎓 Understanding the Issue

### Why This Happens:

1. **Next.js Dynamic Routes:** Your `[country-locale]` folder becomes `%5Bcountry-locale%5D` in URLs
2. **Server Security:** Web servers block encoded characters by default
3. **Static Files:** Files must be served directly, not through Next.js proxy

### The Solution:

1. **Tell server to allow encoded characters** (`AllowEncodedSlashes` for Apache)
2. **Serve static files directly** (not through proxy)
3. **Ensure files exist** (deploy `.next` folder)

---

## 📞 Need Help?

### Gather This Info:

```bash
# 1. Which web server?
ps aux | grep -E 'nginx|apache'

# 2. Check if Next.js is running
pm2 status

# 3. Check files exist
ls -la /var/www/monsbah/.next/static/

# 4. Check recent errors
sudo tail -20 /var/log/nginx/error.log  # or apache2
pm2 logs monsbah --lines 20

# 5. Test static file
curl -I "https://monsbah.com/_next/static/chunks/main-app-xxx.js"
```

Share this output for diagnosis.

---

## 🔗 External Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [PM2 Quick Start](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Apache Proxy Guide](https://httpd.apache.org/docs/2.4/howto/reverse_proxy.html)

---

## 📌 Remember

- Always test locally first: `npm run build && npm run start`
- Always backup before making server changes
- Always check logs after deployment
- Always verify in browser after changes

---

**Last Updated:** October 7, 2025
**Next.js Version:** 15.5.2
**Status:** ✅ Solutions Ready

**👉 START WITH:** [QUICK-FIX.md](./QUICK-FIX.md) for immediate fix!
