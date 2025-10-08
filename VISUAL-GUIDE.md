# Step-by-Step Visual Guide to Fix 400 Error

```
┌─────────────────────────────────────────────────────────────┐
│ 🚨 CURRENT STATUS: Website showing 400 errors              │
│ Goal: Fix server configuration to serve chunk files        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Access Your Server                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On your computer:                                          │
│  $ ssh your-username@your-server-ip                         │
│                                                             │
│  ✓ You should now be logged into your production server    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Identify Web Server                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Run: $ ps aux | grep nginx                                 │
│       $ ps aux | grep apache                                │
│                                                             │
│  ┌───────────────┐        ┌───────────────┐               │
│  │ Found nginx?  │        │ Found apache? │               │
│  │   Go LEFT ←   │        │   Go RIGHT →  │               │
│  └───────────────┘        └───────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│ NGINX PATH           │    │ APACHE PATH          │
├──────────────────────┤    ├──────────────────────┤
│                      │    │                      │
│ STEP 3A: Edit Nginx  │    │ STEP 3B: Edit Apache │
│                      │    │                      │
│ Find config:         │    │ Find config:         │
│ $ ls /etc/nginx/     │    │ $ ls /etc/apache2/   │
│   sites-enabled/     │    │   sites-enabled/     │
│                      │    │                      │
│ Edit:                │    │ Edit:                │
│ $ sudo nano /etc/    │    │ $ sudo nano /etc/    │
│   nginx/sites-       │    │   apache2/sites-     │
│   enabled/monsbah*   │    │   enabled/monsbah*   │
│                      │    │                      │
└──────────────────────┘    └──────────────────────┘
          ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│ STEP 4A: Add Config  │    │ STEP 4B: Add Config  │
├──────────────────────┤    ├──────────────────────┤
│                      │    │                      │
│ Inside server {      │    │ Inside <VirtualHost  │
│   block, add:        │    │   *:443>, add:       │
│                      │    │                      │
│ location /_next/     │    │ AllowEncodedSlashes  │
│   static {           │    │   NoDecode           │
│   alias /var/www/    │    │                      │
│     monsbah/.next/   │    │ ProxyPass /_next/    │
│     static;          │    │   static !           │
│   expires 1y;        │    │                      │
│ }                    │    │ Alias /_next/static  │
│                      │    │   /var/www/monsbah/  │
│ location /_next/ {   │    │   .next/static       │
│   proxy_pass http:// │    │                      │
│     localhost:3000;  │    │ <Directory "...">    │
│ }                    │    │   Require all granted│
│                      │    │ </Directory>         │
│                      │    │                      │
│ Save: Ctrl+X → Y     │    │ Save: Ctrl+X → Y     │
│                      │    │                      │
└──────────────────────┘    └──────────────────────┘
          ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│ STEP 5A: Test Nginx  │    │ STEP 5B: Test Apache │
├──────────────────────┤    ├──────────────────────┤
│                      │    │                      │
│ $ sudo nginx -t      │    │ $ sudo apachectl     │
│                      │    │     configtest       │
│                      │    │                      │
│ Should say:          │    │ Should say:          │
│ "test successful"    │    │ "Syntax OK"          │
│                      │    │                      │
└──────────────────────┘    └──────────────────────┘
          ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│ STEP 6A: Reload      │    │ STEP 6B: Reload      │
├──────────────────────┤    ├──────────────────────┤
│                      │    │                      │
│ $ sudo systemctl     │    │ $ sudo systemctl     │
│   reload nginx       │    │   reload apache2     │
│                      │    │                      │
└──────────────────────┘    └──────────────────────┘
          ↓                            ↓
          └────────────┬───────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Verify The Fix                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Test 1: Check static file                                  │
│  $ curl -I https://monsbah.com/_next/static/chunks/main-*  │
│  ✓ Should return: HTTP/2 200                                │
│                                                             │
│  Test 2: Check encoded URL                                  │
│  $ curl -I "https://monsbah.com/_next/static/chunks/       │
│             app/%5Bcountry-locale%5D/layout-*.js"           │
│  ✓ Should return: HTTP/2 200                                │
│                                                             │
│  Test 3: Check in browser                                   │
│  - Open https://monsbah.com                                 │
│  - Press F12                                                │
│  - Refresh page                                             │
│  ✓ Console should have NO errors                            │
│  ✓ Network tab should show all files as 200                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                       ↓
         ┌─────────────┴─────────────┐
         ↓                           ↓
┌──────────────────┐      ┌──────────────────┐
│ ✅ SUCCESS!      │      │ ❌ STILL BROKEN? │
├──────────────────┤      ├──────────────────┤
│                  │      │                  │
│ Your website     │      │ Check:           │
│ should now load  │      │                  │
│ without errors!  │      │ 1. Files exist:  │
│                  │      │    ls -la /var/  │
│ All pages work:  │      │    www/monsbah/  │
│ - /sa-ar ✓      │      │    .next/static/ │
│ - /kw-en ✓      │      │                  │
│ - /ae-ar ✓      │      │ 2. Permissions:  │
│ - etc... ✓      │      │    sudo chown -R │
│                  │      │    www-data:www- │
│ No 400 errors ✓ │      │    data /var/www │
│                  │      │                  │
│ 🎉 Done!        │      │ 3. Check logs:   │
│                  │      │    See FIX-NOW.md│
│                  │      │    "Still Not    │
│                  │      │    Working?"     │
│                  │      │    section       │
│                  │      │                  │
└──────────────────┘      └──────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ 📋 CHECKLIST                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  □ SSH into server                                          │
│  □ Identify web server (nginx or apache)                    │
│  □ Find config file                                         │
│  □ Edit config file                                         │
│  □ Add fix configuration                                    │
│  □ Save changes                                             │
│  □ Test configuration                                       │
│  □ Reload web server                                        │
│  □ Test with curl                                           │
│  □ Test in browser                                          │
│  □ Verify all locales work                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ 🔗 QUICK REFERENCE                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Files to help you:                                         │
│  • FIX-NOW.md            ← Read this first!                 │
│  • fix-400-error.sh      ← Run on server for help           │
│  • nginx.conf            ← Complete nginx config            │
│  • apache.conf           ← Complete apache config           │
│  • QUICK-FIX.md          ← Detailed instructions           │
│                                                             │
│  Commands summary:                                          │
│  • Find server:   ps aux | grep nginx                       │
│  • Edit nginx:    sudo nano /etc/nginx/sites-enabled/*      │
│  • Edit apache:   sudo nano /etc/apache2/sites-enabled/*    │
│  • Test nginx:    sudo nginx -t                             │
│  • Test apache:   sudo apachectl configtest                 │
│  • Reload nginx:  sudo systemctl reload nginx               │
│  • Reload apache: sudo systemctl reload apache2             │
│                                                             │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ ⏱️ ESTIMATED TIME: 5-10 minutes                             │
└─────────────────────────────────────────────────────────────┘
```

---

## What This Fix Does

**Before:**
```
Browser → monsbah.com → Server → ❌ 400 Error (blocks %5B %5D)
```

**After:**
```
Browser → monsbah.com → Server → ✅ Serves files from .next/static/
```

---

## Key Points

1. **The problem:** Server sees `%5B` and `%5D` and blocks the request
2. **The fix:** Tell server to allow these characters and serve files directly
3. **The result:** Files load correctly, website works

---

**Need help?** Open **FIX-NOW.md** for detailed instructions!
