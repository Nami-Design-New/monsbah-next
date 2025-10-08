# Quick Fix for 400 Bad Request Error

## Immediate Actions (Do This First)

### 1. Check Your Current Server Setup

**If using Nginx:**
```bash
# SSH into your server
ssh your-server

# Check current nginx config
cat /etc/nginx/sites-enabled/monsbah.com
```

**If using Apache:**
```bash
# SSH into your server
ssh your-server

# Check current apache config
cat /etc/apache2/sites-enabled/monsbah.com.conf
```

### 2. Quick Fix for Nginx

Add this to your nginx config inside the `server` block:

```nginx
# Fix for encoded characters in URLs
location /_next/static {
    alias /var/www/monsbah/.next/static;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
}

# Proxy all other /_next requests
location /_next/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Then reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Quick Fix for Apache

Add this to your apache config:

```apache
# CRITICAL: Allow encoded characters
AllowEncodedSlashes NoDecode

# Don't proxy static files
ProxyPass /_next/static !

# Serve static files directly
Alias /_next/static /var/www/monsbah/.next/static

<Directory "/var/www/monsbah/.next/static">
    Require all granted
    Options -Indexes
</Directory>
```

Then reload:
```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

### 4. Verify Static Files Exist

```bash
# Check if .next folder exists
ls -la /var/www/monsbah/.next/

# Check if static folder exists
ls -la /var/www/monsbah/.next/static/

# Check if chunks exist
ls -la /var/www/monsbah/.next/static/chunks/
```

**If files are missing:**
```bash
# Rebuild on server
cd /var/www/monsbah
npm run build

# OR upload from local
scp -r .next your-server:/var/www/monsbah/
```

### 5. Check Permissions

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah/.next
```

### 6. Restart Everything

```bash
# Restart Next.js app
pm2 restart monsbah

# Restart web server
sudo systemctl reload nginx  # or apache2

# Check status
pm2 status
curl http://localhost:3000
```

## Common Mistakes

### ❌ Mistake 1: .next folder not deployed
**Symptom:** All chunk files return 404
**Fix:** Deploy the entire `.next` folder to server

### ❌ Mistake 2: Wrong path in nginx/apache config
**Symptom:** 404 or 403 errors
**Fix:** Update the alias/directory path to match your actual deployment location

### ❌ Mistake 3: Next.js not running
**Symptom:** 502 Bad Gateway
**Fix:** 
```bash
pm2 status
pm2 restart monsbah
pm2 logs monsbah
```

### ❌ Mistake 4: Encoded characters blocked
**Symptom:** 400 Bad Request for files with %5B or %5D
**Fix:** Add `AllowEncodedSlashes NoDecode` (Apache) or proper location blocks (Nginx)

### ❌ Mistake 5: Wrong permissions
**Symptom:** 403 Forbidden
**Fix:** 
```bash
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah
```

## Test Your Fix

### 1. Test static files directly:
```bash
curl -I https://monsbah.com/_next/static/chunks/main-app-xxx.js
# Should return: HTTP/2 200
```

### 2. Test with encoded characters:
```bash
curl -I https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js
# Should return: HTTP/2 200
```

### 3. Check browser console:
- Open https://monsbah.com
- Open DevTools (F12)
- Refresh page
- Check Console tab - should have no errors
- Check Network tab - all files should return 200

## Still Not Working?

### Check Logs:

**Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/monsbah-error.log
```

**Apache logs:**
```bash
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/monsbah-error.log
```

**PM2 logs:**
```bash
pm2 logs monsbah --lines 100
```

**Next.js logs:**
```bash
cat /var/www/monsbah/logs/pm2-error.log
cat /var/www/monsbah/logs/pm2-out.log
```

## Need Help?

1. Check what web server you're using:
```bash
ps aux | grep nginx
ps aux | grep apache
```

2. Get your current config:
```bash
# For Nginx
cat /etc/nginx/sites-enabled/*

# For Apache
cat /etc/apache2/sites-enabled/*
```

3. Share the output of:
```bash
curl -I https://monsbah.com
curl -I https://monsbah.com/_next/static/chunks/main-app-xxx.js
pm2 status
ls -la /var/www/monsbah/.next/
```

---
**Remember:** After ANY config change, always reload the web server!
