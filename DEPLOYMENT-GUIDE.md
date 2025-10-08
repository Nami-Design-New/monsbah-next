# Production Deployment Guide - Fix 400 Bad Request Error

## Problem
Getting `400 Bad Request` errors for Next.js chunk files like:
```
GET https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js
```

The `%5B` and `%5D` are URL-encoded brackets `[` and `]` from the dynamic route folder name.

## Root Cause
1. **Server misconfiguration**: Apache/Nginx blocking encoded characters in URLs
2. **Missing static files**: `.next` folder not properly deployed
3. **Incorrect proxy setup**: Static files being proxied instead of served directly

## Solution

### Step 1: Update next.config.mjs ✅
Already updated with:
- Standalone output mode
- Proper cache headers
- Static asset configuration

### Step 2: Choose Your Server Configuration

#### Option A: Using Nginx (Recommended)

1. **Copy the nginx.conf file to your server:**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/monsbah.com
```

2. **Update SSL certificate paths in the config:**
```nginx
ssl_certificate /etc/ssl/certs/monsbah.com.crt;
ssl_certificate_key /etc/ssl/private/monsbah.com.key;
```

3. **Update the application path** (if different from `/var/www/monsbah`):
```nginx
alias /var/www/monsbah/.next/static;
```

4. **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/monsbah.com /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

#### Option B: Using Apache

1. **Enable required Apache modules:**
```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers expires deflate ssl
```

2. **Copy the apache.conf file:**
```bash
sudo cp apache.conf /etc/apache2/sites-available/monsbah.com.conf
```

3. **Update SSL certificate paths and application path in the config**

4. **Enable the site:**
```bash
sudo a2ensite monsbah.com.conf
sudo apachectl configtest  # Test configuration
sudo systemctl reload apache2
```

### Step 3: Deploy Your Application

1. **Build the application locally:**
```bash
npm run build
```

2. **Transfer files to server** (include ALL of these):
```bash
rsync -avz --exclude 'node_modules' \
  .next/ \
  public/ \
  package.json \
  package-lock.json \
  next.config.mjs \
  your-server:/var/www/monsbah/
```

3. **Install dependencies on server:**
```bash
ssh your-server
cd /var/www/monsbah
npm ci --omit=dev
```

4. **Set correct permissions:**
```bash
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah
```

### Step 4: Run Next.js with PM2 (Process Manager)

1. **Install PM2 globally on server:**
```bash
sudo npm install -g pm2
```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'monsbah',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/monsbah',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

3. **Start the application:**
```bash
cd /var/www/monsbah
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable auto-start on server reboot
```

### Step 5: Verify Deployment

1. **Check if Next.js is running:**
```bash
pm2 status
curl http://localhost:3000  # Should return HTML
```

2. **Check static files are accessible:**
```bash
ls -la /var/www/monsbah/.next/static/chunks/
```

3. **Test the website:**
```bash
curl -I https://monsbah.com/_next/static/chunks/app/%5Bcountry-locale%5D/layout-xxx.js
# Should return 200 OK, not 400
```

## Troubleshooting

### Issue: Still getting 400 errors

**For Nginx:**
```bash
# Check error logs
sudo tail -f /var/log/nginx/monsbah-error.log

# Verify static files location
ls -la /var/www/monsbah/.next/static/
```

**For Apache:**
```bash
# Check if AllowEncodedSlashes is working
sudo apache2ctl -M | grep rewrite
sudo tail -f /var/log/apache2/monsbah-error.log
```

### Issue: 404 for static files

**Check file permissions:**
```bash
sudo chown -R www-data:www-data /var/www/monsbah
sudo chmod -R 755 /var/www/monsbah/.next
```

### Issue: Next.js not starting

**Check PM2 logs:**
```bash
pm2 logs monsbah
pm2 restart monsbah
```

**Check if port 3000 is in use:**
```bash
sudo netstat -tlnp | grep 3000
```

## Alternative: Docker Deployment (Recommended for Production)

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  monsbah:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**Deploy with Docker:**
```bash
docker-compose up -d --build
```

## Quick Fix Commands

If you're in a hurry, try these quick fixes:

### For Nginx:
```bash
# Add to nginx config inside server block
location /_next/static {
    alias /var/www/monsbah/.next/static;
}

sudo systemctl reload nginx
```

### For Apache:
```bash
# Add to apache config
AllowEncodedSlashes NoDecode

sudo systemctl reload apache2
```

## Verification Checklist

- [ ] Next.js application builds successfully (`npm run build`)
- [ ] `.next` folder exists and contains `static` directory
- [ ] Application runs locally in production mode (`npm run start`)
- [ ] Files deployed to server with correct permissions
- [ ] PM2 shows app as "online"
- [ ] Nginx/Apache configuration includes static file serving
- [ ] SSL certificates are valid and configured
- [ ] Website loads without console errors
- [ ] All chunk files return 200 status

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

---
**Last Updated:** $(date)
**Status:** Ready for deployment
