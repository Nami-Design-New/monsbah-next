# 🚨 START HERE - Fix Your 400 Error

## What's Wrong?
Your website https://monsbah.com is showing this error:
```
GET /_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js
net::ERR_ABORTED 400 (Bad Request)
```

## What Does This Mean?
Your server (Nginx or Apache) is **blocking** Next.js chunk files because of special characters (`%5B` and `%5D`) in the URL.

## How to Fix It?
Follow **ONE** of these guides based on how much time you have:

---

## ⚡ Option 1: Super Quick (5 minutes)

**Read this file:**
```
📄 FIX-NOW.md
```

This has the exact commands to copy/paste into your server.

---

## 🎯 Option 2: Visual Guide (10 minutes)

**Read this file:**
```
📄 VISUAL-GUIDE.md
```

This has a flowchart showing exactly what to do step-by-step.

---

## 📚 Option 3: Complete Guide (30 minutes)

**Read these files in order:**
1. `README-SERVER-FIX.md` - Overview
2. `QUICK-FIX.md` - Detailed instructions
3. `DEPLOYMENT-GUIDE.md` - Full deployment

---

## 🤖 Option 4: Interactive Script

**Upload and run on your server:**
```bash
# Upload the script
scp fix-400-error.sh your-user@monsbah.com:/tmp/

# SSH into server
ssh your-user@monsbah.com

# Run the script
bash /tmp/fix-400-error.sh
```

---

## ✅ What You'll Need

1. **SSH access** to your server (monsbah.com)
2. **Know if you use Nginx or Apache** (the script can detect this)
3. **Sudo permissions** to edit server config
4. **5 minutes** of your time

---

## 🎯 Quick Summary

### For Nginx:
Add this to your config:
```nginx
location /_next/static {
    alias /var/www/monsbah/.next/static;
}
```

### For Apache:
Add this to your config:
```apache
AllowEncodedSlashes NoDecode
ProxyPass /_next/static !
Alias /_next/static /var/www/monsbah/.next/static
```

Then reload your server.

---

## 📁 All Available Files

| File | What It Does |
|------|--------------|
| **FIX-NOW.md** ⭐ | Step-by-step commands (START HERE) |
| **VISUAL-GUIDE.md** | Flowchart with visual steps |
| **README-SERVER-FIX.md** | Complete overview |
| **QUICK-FIX.md** | Detailed quick fix guide |
| **DEPLOYMENT-GUIDE.md** | Full deployment instructions |
| **TROUBLESHOOTING-CHECKLIST.md** | If things go wrong |
| **fix-400-error.sh** | Interactive script for server |
| **nginx.conf** | Complete Nginx configuration |
| **apache.conf** | Complete Apache configuration |

---

## 🆘 Still Confused?

**Just do this:**

1. Open `FIX-NOW.md`
2. SSH into your server
3. Copy/paste the commands for your web server
4. Done!

---

## ✅ How You'll Know It's Fixed

After applying the fix:
- Open https://monsbah.com in your browser
- Press F12 (Developer Tools)
- Refresh the page
- **Check Console tab:** Should have NO errors
- **Check Network tab:** All files should show "200" status
- **Try different locales:** /sa-ar, /kw-en, etc. - all should work

---

## 🎉 Success Looks Like This

**Before:**
```
Console: ❌ 400 Bad Request errors
Network: ❌ Failed to load chunks
Website: ❌ Broken or partially loading
```

**After:**
```
Console: ✅ No errors
Network: ✅ All files 200 OK
Website: ✅ Fully working
```

---

## ⏱️ Time Required

- **Reading:** 2 minutes
- **SSHing to server:** 1 minute
- **Editing config:** 2 minutes
- **Testing:** 1 minute
- **Total:** ~5-6 minutes

---

## 🚀 Ready to Start?

👉 **Open FIX-NOW.md now!**

Or if you prefer visuals:
👉 **Open VISUAL-GUIDE.md**

---

**Created:** October 7, 2025  
**Your Issue:** https://monsbah.com - 400 Bad Request errors  
**Cause:** Server blocking encoded brackets in chunk URLs  
**Fix:** Configure server to allow and serve static files  
**Time:** 5 minutes  
**Difficulty:** Easy (copy/paste commands)
