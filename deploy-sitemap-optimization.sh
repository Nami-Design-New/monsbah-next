#!/bin/bash

# Products Sitemap Optimization Deployment Script
# Date: October 19, 2025

set -e  # Exit on error

echo "======================================"
echo "Products Sitemap Optimization Deploy"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root for nginx commands
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Nginx commands will require sudo${NC}"
    SUDO="sudo"
else
    SUDO=""
fi

echo "Step 1: Backup current nginx config..."
$SUDO cp /etc/nginx/sites-available/monsbah.com /etc/nginx/sites-available/monsbah.com.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

echo "Step 2: Update nginx configuration..."
$SUDO cp nginx.conf /etc/nginx/sites-available/monsbah.com

echo "Step 3: Test nginx configuration..."
if $SUDO nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration invalid! Rolling back...${NC}"
    $SUDO cp /etc/nginx/sites-available/monsbah.com.backup.* /etc/nginx/sites-available/monsbah.com
    exit 1
fi

echo "Step 4: Reload nginx..."
$SUDO systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}"

echo ""
echo "Step 5: Install dependencies (if needed)..."
npm install --production=false

echo ""
echo "Step 6: Build Next.js with ISR optimization..."
echo -e "${YELLOW}This will pre-generate 60 sitemaps (12 locales × 5 each)${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi

echo ""
echo "Step 7: Restart application..."
if command -v pm2 &> /dev/null; then
    pm2 restart monsbah-next || pm2 start npm --name "monsbah-next" -- start
    pm2 save
    echo -e "${GREEN}✓ PM2 restarted${NC}"
else
    echo -e "${YELLOW}PM2 not found. Please restart your application manually.${NC}"
fi

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""

echo "Testing sitemaps..."
echo ""

# Test a few sitemaps
LOCALES=("kw-en" "kw-ar" "sa-en")
BASE_URL="http://localhost:3000"

for locale in "${LOCALES[@]}"; do
    echo "Testing: ${BASE_URL}/${locale}/products/sitemap0.xml"
    
    START_TIME=$(date +%s)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/${locale}/products/sitemap0.xml")
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ ${locale}/products/sitemap0.xml - Status: $HTTP_CODE, Time: ${ELAPSED}s${NC}"
    else
        echo -e "${RED}✗ ${locale}/products/sitemap0.xml - Status: $HTTP_CODE${NC}"
    fi
done

echo ""
echo -e "${GREEN}Deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Monitor logs: pm2 logs monsbah-next"
echo "2. Check nginx logs: sudo tail -f /var/log/nginx/monsbah-error.log"
echo "3. Test production: curl -I https://monsbah.com/kw-en/products/sitemap0.xml"
echo "4. Submit updated sitemaps to Google Search Console"
echo ""
