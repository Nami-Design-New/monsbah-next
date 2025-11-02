#!/bin/bash

# Monsbah Hreflang Fix Deployment Script
# This script deploys the hreflang fixes to production

set -e  # Exit on error

echo "======================================"
echo "🚀 Monsbah Hreflang Fix Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${YELLOW}📍 Current directory: $(pwd)${NC}"
echo ""

# Step 2: Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Step 3: Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Restart PM2
echo -e "${YELLOW}♻️  Restarting PM2 process...${NC}"

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    pm2 restart monsbah
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PM2 restart successful${NC}"
    else
        echo -e "${RED}❌ PM2 restart failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ PM2 not found${NC}"
    echo "Please install PM2: npm install -g pm2"
    echo "Or start manually: npm run start"
    exit 1
fi
echo ""

# Step 5: Wait for server to start
echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
sleep 5
echo ""

# Step 6: Test deployment
echo "======================================"
echo "🧪 Testing Deployment"
echo "======================================"
echo ""

echo "Test 1: Checking for HTTP Link headers (should be empty)..."
HEADER_TEST=$(curl -I https://monsbah.com/kw-ar/ 2>/dev/null | grep -i "link:" || true)

if [ -z "$HEADER_TEST" ]; then
    echo -e "${GREEN}✅ PASS: No HTTP Link headers found${NC}"
else
    echo -e "${RED}❌ FAIL: HTTP Link headers still present${NC}"
    echo "$HEADER_TEST"
fi
echo ""

echo "Test 2: Checking for correct hreflang format in HTML..."
HTML_TEST=$(curl -s https://monsbah.com/kw-ar/ 2>/dev/null | grep 'hreflang="ar-KW"' || true)

if [ -n "$HTML_TEST" ]; then
    echo -e "${GREEN}✅ PASS: Correct hreflang format found (ar-KW)${NC}"
else
    echo -e "${RED}❌ FAIL: Correct format not found${NC}"
    echo "Note: May need to clear CDN cache"
fi
echo ""

echo "Test 3: Checking PM2 status..."
pm2 list | grep monsbah
echo ""

# Step 7: Summary
echo "======================================"
echo "📊 Deployment Summary"
echo "======================================"
echo ""
echo -e "${GREEN}✅ Code deployed successfully${NC}"
echo ""
echo "Next steps:"
echo "1. Wait 2-3 minutes for changes to propagate"
echo "2. If using CDN (CloudFlare, etc.), clear the cache"
echo "3. Test at: https://hreflangchecker.com/report"
echo "4. Check PM2 logs: pm2 logs monsbah"
echo ""
echo "Expected results:"
echo "  ✅ No 'Source: header' entries"
echo "  ✅ Only 'Source: html' entries"
echo "  ✅ All hreflang codes use uppercase (ar-KW, en-SA, etc.)"
echo "  ✅ No 'Multiple x-default' warning"
echo "  ✅ No ISO code errors"
echo ""
echo "======================================"
echo "🎉 Deployment Complete!"
echo "======================================"
