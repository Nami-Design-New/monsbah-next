# 400 Bad Request - Troubleshooting Checklist

## The Problem
```
GET https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js 
net::ERR_ABORTED 400 (Bad Request)
```

The `%5B` and `%5D` are URL-encoded brackets `[` and `]` from your dynamic route folder `[country-locale]`.

---

## Step-by-Step Fix

### ✅ Step 1: Update next.config.mjs
- [ ] Added `output: 'standalone'`
- [ ] Added cache headers for `/_next/static` and `/_next`
- [ ] File updated ✓ (already done in this session)

### ✅ Step 2: Rebuild Application
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] `.next` folder created
- [ ] `.next/static/chunks` folder contains files

### ✅ Step 3: Deploy Files to Server

**Check what needs to be uploaded:**
- [ ] `.next/` folder (entire folder)
- [ ] `public/` folder
- [ ] `package.json`
- [ ] `package-lock.json`
- [ ] `next.config.mjs`
- [ ] `ecosystem.config.js` (if using PM2)

**Upload command:**
```bash
rsync -avz --exclude 'node_modules' --exclude '.git' \
  .next/ public/ package.json package-lock.json next.config.mjs \
  your-user@your-server:/var/www/monsbah/
```

### ✅ Step 4: Install Dependencies on Server
```bash
ssh your-server
cd /var/www/monsbah
npm ci --omit=dev
```
- [ ] Dependencies installed without errors

### ✅ Step 5: Configure Web Server

#### For Nginx Users:
1. [ ] Copy `nginx.conf` to `/etc/nginx/sites-available/monsbah.com`
2. [ ] Update SSL certificate paths
3. [ ] Update application path (if not `/var/www/monsbah`)
4. [ ] Create symbolic link: `ln -s /etc/nginx/sites-available/monsbah.com /etc/nginx/sites-enabled/`
5. [ ] Test config: `sudo nginx -t`
6. [ ] Reload: `sudo systemctl reload nginx`

**Critical Nginx settings:**
```nginx
location /_next/static {
    alias /var/www/monsbah/.next/static;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
}
```

#### For Apache Users:
1. [ ] Enable modules: `sudo a2enmod proxy proxy_http rewrite headers`
2. [ ] Copy `apache.conf` to `/etc/apache2/sites-available/monsbah.com.conf`
3. [ ] Update SSL certificate paths
4. [ ] Update application path
5. [ ] Enable site: `sudo a2ensite monsbah.com.conf`
6. [ ] Test config: `sudo apachectl configtest`
7. [ ] Reload: `sudo systemctl reload apache2`

**Critical Apache settings:**
```apache
AllowEncodedSlashes NoDecode
ProxyPass /_next/static !
Alias /_next/static /var/www/monsbah/.next/static
```

### ✅ Step 6: Set Correct Permissions
```bash
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah
```
- [ ] Permissions set

### ✅ Step 7: Start Next.js Application

**Install PM2 (if not installed):**
```bash
sudo npm install -g pm2
```

**Start application:**
```bash
cd /var/www/monsbah
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Check status:**
```bash
pm2 status
pm2 logs monsbah
```
- [ ] PM2 shows status as "online"
- [ ] No errors in logs

### ✅ Step 8: Verify Deployment

**Test 1: Check if Next.js is running**
```bash
curl http://localhost:3000
```
- [ ] Returns HTML content

**Test 2: Check static files exist**
```bash
ls -la /var/www/monsbah/.next/static/chunks/
```
- [ ] Files exist

**Test 3: Test static file serving**
```bash
curl -I https://monsbah.com/_next/static/chunks/main-app-xxx.js
```
- [ ] Returns `200 OK` (not 404, 403, or 400)

**Test 4: Test with encoded characters**
```bash
curl -I https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js
```
- [ ] Returns `200 OK` (not 400)

**Test 5: Check website in browser**
- [ ] Open https://monsbah.com
- [ ] No errors in Console (F12)
- [ ] All network requests return 200
- [ ] Page loads completely

---

## Common Issues & Solutions

### Issue 1: 404 Not Found
**Symptom:** Static files return 404
**Cause:** Files don't exist or wrong path
**Fix:**
```bash
# Check files exist
ls -la /var/www/monsbah/.next/static/

# If missing, rebuild and upload
npm run build
rsync -avz .next/ your-server:/var/www/monsbah/.next/
```

### Issue 2: 403 Forbidden
**Symptom:** Static files return 403
**Cause:** Wrong permissions
**Fix:**
```bash
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah
```

### Issue 3: 400 Bad Request
**Symptom:** Files with %5B or %5D return 400
**Cause:** Server blocking encoded characters
**Fix:**
- **Nginx:** Add proper location blocks (see nginx.conf)
- **Apache:** Add `AllowEncodedSlashes NoDecode`

### Issue 4: 502 Bad Gateway
**Symptom:** Entire site returns 502
**Cause:** Next.js not running
**Fix:**
```bash
pm2 status
pm2 restart monsbah
pm2 logs monsbah
```

### Issue 5: Chunks still loading from old build
**Symptom:** 404 for specific chunk hashes
**Cause:** Cached old build, new build not deployed
**Fix:**
```bash
# Force rebuild
npm run build

# Clear .next on server
ssh your-server "rm -rf /var/www/monsbah/.next"

# Re-upload
rsync -avz .next/ your-server:/var/www/monsbah/.next/

# Restart
ssh your-server "pm2 restart monsbah"

# Clear browser cache (Ctrl+Shift+Delete)
```

---

## Quick Diagnosis Commands

**Check web server:**
```bash
# Which server?
ps aux | grep nginx
ps aux | grep apache

# Is it running?
sudo systemctl status nginx  # or apache2
```

**Check Next.js:**
```bash
pm2 status
curl http://localhost:3000
```

**Check files:**
```bash
ls -la /var/www/monsbah/
ls -la /var/www/monsbah/.next/static/chunks/
```

**Check permissions:**
```bash
ls -ld /var/www/monsbah/.next
ls -ld /var/www/monsbah/.next/static
```

**Check logs:**
```bash
# Web server logs
sudo tail -20 /var/log/nginx/error.log
sudo tail -20 /var/log/apache2/error.log

# PM2 logs
pm2 logs monsbah --lines 50

# Check for specific errors
sudo grep "400" /var/log/nginx/access.log
sudo grep "_next" /var/log/nginx/error.log
```

---

## Final Checklist

Before declaring success, verify ALL of these:

- [ ] `npm run build` completes successfully locally
- [ ] `.next` folder uploaded to server
- [ ] Dependencies installed on server (`npm ci`)
- [ ] Permissions correct (755 for folders, www-data owner)
- [ ] Web server config includes static file serving
- [ ] `AllowEncodedSlashes NoDecode` in Apache OR proper location blocks in Nginx
- [ ] PM2 shows app as "online"
- [ ] `curl http://localhost:3000` returns HTML
- [ ] `curl https://monsbah.com` returns HTML
- [ ] Browser DevTools shows no 400 errors
- [ ] All pages load correctly
- [ ] Dynamic routes (sa-ar, kw-en, etc.) work

---

## Get Help

If still not working, gather this info:

1. Web server and version:
```bash
nginx -v  # or apache2 -v
```

2. Node and npm versions:
```bash
node -v
npm -v
```

3. Current config:
```bash
# Nginx
cat /etc/nginx/sites-enabled/monsbah.com

# Apache
cat /etc/apache2/sites-enabled/monsbah.com.conf
```

4. Recent logs:
```bash
sudo tail -50 /var/log/nginx/error.log
pm2 logs monsbah --lines 50
```

5. File structure:
```bash
ls -laR /var/www/monsbah/.next/static/ | head -50
```

---

**Last Updated:** $(date)
