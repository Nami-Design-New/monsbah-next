# 🚨 IMMEDIATE FIX - Your Server is Blocking Chunks

## Current Situation
✅ You ran: `git clone` → `npm install` → `npm run build` → `npm start` or `pm2 start`
❌ Browser shows: 400 Bad Request for chunk files

## The Problem
Your Nginx/Apache is blocking URLs with `%5B` and `%5D` (encoded brackets).

---

## 🔧 FIX IT NOW (You're Already on the Server)

### Step 1: Which web server are you using?
```bash
ps aux | grep nginx
ps aux | grep apache
```

### Step 2A: If You See NGINX

#### 1. Find your config:
```bash
ls -la /etc/nginx/sites-enabled/
```
Look for a file like `monsbah.com` or `default`

#### 2. Edit it:
```bash
sudo nano /etc/nginx/sites-enabled/monsbah.com
```
(Replace `monsbah.com` with your actual filename)

#### 3. Find the `server {` block and add this INSIDE it:
```nginx
# FIX: Allow encoded brackets and serve static files
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

**IMPORTANT:** Change `/var/www/monsbah` to your actual project path if different!

#### 4. Save and exit:
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

#### 5. Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 2B: If You See APACHE

#### 1. Find your config:
```bash
ls -la /etc/apache2/sites-enabled/
```
Look for a file like `monsbah.com.conf` or `000-default-le-ssl.conf`

#### 2. Edit it:
```bash
sudo nano /etc/apache2/sites-enabled/monsbah.com.conf
```

#### 3. Add this at the TOP of `<VirtualHost *:443>` block:
```apache
# FIX: Allow encoded brackets
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

**IMPORTANT:** Change `/var/www/monsbah` to your actual project path!

#### 4. Save and exit:
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

#### 5. Test and reload:
```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

---

## ✅ Step 3: Verify It Works

### Test from command line:
```bash
curl -I "https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-4cce1785ff5d260b.js"
```
**Should return:** `HTTP/2 200` or `HTTP/1.1 200` (NOT 400!)

### Test in browser:
1. Open https://monsbah.com
2. Press `Ctrl + Shift + R` (hard refresh)
3. Press `F12` to open DevTools
4. Check Console - should have NO errors
5. Check Network tab - all files should be 200

---

## 🆘 Common Issues

### Issue 1: "Permission denied"
You need sudo:
```bash
sudo nano /etc/nginx/sites-enabled/monsbah.com
```

### Issue 2: "Can't find the config file"
List all files:
```bash
# For Nginx
ls -la /etc/nginx/sites-enabled/
ls -la /etc/nginx/conf.d/

# For Apache  
ls -la /etc/apache2/sites-enabled/
```

### Issue 3: Still getting 400 errors
Check if files exist:
```bash
ls -la /var/www/monsbah/.next/static/chunks/
```

If empty, check where you built:
```bash
pwd
ls -la .next/static/chunks/
```

Update the path in the nginx/apache config to match!

### Issue 4: "nginx: command not found"
You might have Apache:
```bash
apache2 -v
apachectl -V
```

---

## 📝 Quick Checklist

- [ ] I'm on the server (SSH'd in)
- [ ] I found which web server I'm using (nginx or apache)
- [ ] I found the config file
- [ ] I added the fix configuration
- [ ] I saved the file
- [ ] I tested the config (`nginx -t` or `apachectl configtest`)
- [ ] I reloaded the server (`systemctl reload`)
- [ ] I tested with curl (returns 200)
- [ ] I tested in browser (no errors)

---

## 🎯 What This Does

**Before:**
```
Browser → monsbah.com → Nginx/Apache sees %5B and %5D → ❌ BLOCKS (400)
```

**After:**
```
Browser → monsbah.com → Nginx/Apache → ✅ Serves from .next/static/
```

---

## 📞 Still Need Help?

Run this to get diagnostic info:
```bash
# What server am I using?
ps aux | grep -E 'nginx|apache' | grep -v grep

# Where are my config files?
ls -la /etc/nginx/sites-enabled/ /etc/apache2/sites-enabled/ 2>/dev/null

# Where is my .next folder?
find /var/www /home /root -name ".next" -type d 2>/dev/null | head -5

# What's in .next/static?
ls -la $(find . -name ".next" -type d 2>/dev/null | head -1)/static/chunks/ 2>/dev/null | head -10
```

Share this output for help!

---

## ⏱️ Time: 3-5 minutes

1. Find config file: 1 min
2. Edit config: 1 min  
3. Reload server: 30 sec
4. Test: 1 min

**Total: ~3-5 minutes to fix!**

---

**Remember:** The build succeeded! You just need to configure the web server to serve the files properly.
