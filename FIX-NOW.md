# 🚨 URGENT: Fix 400 Error NOW

## Your Error:
```
GET https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js
net::ERR_ABORTED 400 (Bad Request)
```

## What's Happening:
Your web server is blocking Next.js chunk files because of the `%5B` and `%5D` (encoded brackets) in the URL.

---

## 🔧 FIX IT NOW (5 Minutes)

### Step 1: SSH into your server
```bash
ssh your-username@monsbah.com
```

### Step 2: Find out which web server you're using
```bash
ps aux | grep nginx
ps aux | grep apache
```

**Or:**
```bash
systemctl status nginx
systemctl status apache2
```

---

## 🔥 For NGINX Users:

### 1. Find your config file:
```bash
ls /etc/nginx/sites-enabled/
```
Look for something like `monsbah.com` or `default`

### 2. Edit the config:
```bash
sudo nano /etc/nginx/sites-enabled/monsbah.com
```

### 3. Add this INSIDE the `server {` block (after `server_name` line):
```nginx
# Fix for 400 Bad Request
location /_next/static {
    alias /var/www/monsbah/.next/static;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
}

location /_next/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 4. Save (Ctrl+X, then Y, then Enter)

### 5. Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔥 For APACHE Users:

### 1. Find your config file:
```bash
ls /etc/apache2/sites-enabled/
```
Look for something like `monsbah.com.conf` or `000-default-le-ssl.conf`

### 2. Edit the config:
```bash
sudo nano /etc/apache2/sites-enabled/monsbah.com.conf
```

### 3. Add this at the TOP of the `<VirtualHost *:443>` block:
```apache
# Fix for 400 Bad Request
AllowEncodedSlashes NoDecode
ProxyPass /_next/static !
Alias /_next/static /var/www/monsbah/.next/static

<Directory "/var/www/monsbah/.next/static">
    Require all granted
    Options -Indexes
    <IfModule mod_headers.c>
        Header set Cache-Control "public, immutable"
    </IfModule>
</Directory>
```

### 4. Save (Ctrl+X, then Y, then Enter)

### 5. Test and reload:
```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

---

## ✅ Step 3: Verify the Fix

### Test static files:
```bash
curl -I https://monsbah.com/_next/static/chunks/main-app-d80558b38337dc06.js
```
**Should return:** `HTTP/2 200` (not 400)

### Test encoded URLs:
```bash
curl -I "https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-4cce1785ff5d260b.js"
```
**Should return:** `HTTP/2 200` (not 400)

### Check in browser:
1. Open https://monsbah.com
2. Press F12 (DevTools)
3. Refresh page (Ctrl+R or Cmd+R)
4. Check Console - should have NO errors
5. Check Network tab - all files should be 200

---

## 🆘 Still Not Working?

### Check if files exist:
```bash
ls -la /var/www/monsbah/.next/static/
ls -la /var/www/monsbah/.next/static/chunks/
```

**If folder is empty or missing:**
```bash
# You need to deploy the .next folder
# From your local machine:
cd /Users/ahmed/Desktop/Front/Freelance/monsbah-next
npm run build
rsync -avz .next/ your-user@monsbah.com:/var/www/monsbah/.next/
```

### Check permissions:
```bash
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah
```

### Check if Next.js is running:
```bash
pm2 status
pm2 restart monsbah
```

### Check logs:
```bash
# Nginx
sudo tail -50 /var/log/nginx/error.log

# Apache
sudo tail -50 /var/log/apache2/error.log

# PM2
pm2 logs monsbah --lines 50
```

---

## 📞 Quick Diagnosis

If still broken, run these and share the output:

```bash
# 1. Which web server?
ps aux | grep -E 'nginx|apache'

# 2. Config content
cat /etc/nginx/sites-enabled/* 2>/dev/null || cat /etc/apache2/sites-enabled/*

# 3. Files exist?
ls -la /var/www/monsbah/.next/static/chunks/ | head -20

# 4. Permissions
ls -ld /var/www/monsbah/.next

# 5. Test request
curl -I "https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-4cce1785ff5d260b.js"
```

---

## 🎯 Summary

**Problem:** Server blocking encoded brackets in URLs
**Solution:** Configure web server to allow and serve static files directly
**Time:** 5 minutes
**Result:** Website loads without errors

---

## 📚 More Help

For detailed guides, see:
- **QUICK-FIX.md** - Expanded quick fix guide
- **README-SERVER-FIX.md** - Complete overview
- **DEPLOYMENT-GUIDE.md** - Full deployment instructions
- **TROUBLESHOOTING-CHECKLIST.md** - Systematic debugging

**Run on server for interactive help:**
```bash
bash fix-400-error.sh
```

---

**Last Updated:** October 7, 2025
**Status:** Ready to deploy
**Your issue:** https://monsbah.com returning 400 for chunk files
