#!/bin/bash

# Quick diagnostic and fix script for 400 error
# Run this ON YOUR SERVER: bash diagnose.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 Monsbah Server Diagnostic Tool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Detect web server
echo -e "${BLUE}[1/6]${NC} Detecting web server..."
if pgrep nginx > /dev/null; then
    SERVER="nginx"
    echo -e "${GREEN}✓ Found: Nginx${NC}"
elif pgrep apache2 > /dev/null; then
    SERVER="apache2"
    echo -e "${GREEN}✓ Found: Apache${NC}"
else
    echo -e "${RED}✗ No web server detected${NC}"
    echo "  Neither nginx nor apache2 is running"
    exit 1
fi
echo ""

# 2. Find config files
echo -e "${BLUE}[2/6]${NC} Looking for config files..."
if [ "$SERVER" = "nginx" ]; then
    CONFIGS=$(ls /etc/nginx/sites-enabled/*monsbah* /etc/nginx/sites-enabled/default 2>/dev/null)
    if [ -z "$CONFIGS" ]; then
        CONFIGS=$(ls /etc/nginx/conf.d/*.conf 2>/dev/null)
    fi
else
    CONFIGS=$(ls /etc/apache2/sites-enabled/*monsbah* /etc/apache2/sites-enabled/*ssl*.conf 2>/dev/null)
fi

if [ -z "$CONFIGS" ]; then
    echo -e "${RED}✗ No config files found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found config files:${NC}"
echo "$CONFIGS" | while read line; do echo "  - $line"; done
CONFIG=$(echo "$CONFIGS" | head -1)
echo ""

# 3. Check if fix is applied
echo -e "${BLUE}[3/6]${NC} Checking if fix is already applied..."
if [ "$SERVER" = "nginx" ]; then
    if grep -q "location /_next/static" "$CONFIG"; then
        echo -e "${GREEN}✓ Fix appears to be applied${NC}"
        FIX_APPLIED="yes"
    else
        echo -e "${YELLOW}⚠ Fix NOT found in config${NC}"
        FIX_APPLIED="no"
    fi
else
    if grep -q "AllowEncodedSlashes" "$CONFIG"; then
        echo -e "${GREEN}✓ Fix appears to be applied${NC}"
        FIX_APPLIED="yes"
    else
        echo -e "${YELLOW}⚠ Fix NOT found in config${NC}"
        FIX_APPLIED="no"
    fi
fi
echo ""

# 4. Find .next folder
echo -e "${BLUE}[4/6]${NC} Looking for .next build folder..."
NEXT_PATHS=$(find /var/www /home /opt -name ".next" -type d 2>/dev/null | head -5)
if [ -z "$NEXT_PATHS" ]; then
    echo -e "${RED}✗ .next folder not found${NC}"
    echo "  Have you run 'npm run build'?"
else
    echo -e "${GREEN}✓ Found .next folder(s):${NC}"
    echo "$NEXT_PATHS" | while read line; do echo "  - $line"; done
    NEXT_PATH=$(echo "$NEXT_PATHS" | head -1)
    
    # Check if chunks exist
    if [ -d "$NEXT_PATH/static/chunks" ]; then
        CHUNK_COUNT=$(ls -1 "$NEXT_PATH/static/chunks/" | wc -l)
        echo -e "${GREEN}✓ Found $CHUNK_COUNT chunk files${NC}"
    else
        echo -e "${RED}✗ No chunks found in $NEXT_PATH/static/${NC}"
    fi
fi
echo ""

# 5. Check if Next.js is running
echo -e "${BLUE}[5/6]${NC} Checking if Next.js is running..."
if pgrep -f "next start" > /dev/null || pgrep -f "npm.*start" > /dev/null || pgrep -f "node.*server" > /dev/null; then
    echo -e "${GREEN}✓ Next.js appears to be running${NC}"
    
    # Check port 3000
    if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
        echo -e "${GREEN}✓ Listening on port 3000${NC}"
    else
        echo -e "${YELLOW}⚠ Not listening on port 3000${NC}"
    fi
else
    echo -e "${RED}✗ Next.js is not running${NC}"
    echo "  Start it with: pm2 start npm --name monsbah -- start"
fi
echo ""

# 6. Test the endpoint
echo -e "${BLUE}[6/6]${NC} Testing chunk file access..."
TEST_URL="http://localhost:3000"
if curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Next.js responds on localhost:3000${NC}"
else
    echo -e "${RED}✗ Next.js not responding${NC}"
fi
echo ""

# Summary and recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  📊 ${BLUE}Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Web Server: $SERVER"
echo "Config File: $CONFIG"
echo "Fix Applied: $FIX_APPLIED"
if [ ! -z "$NEXT_PATH" ]; then
    echo ".next Location: $NEXT_PATH"
fi
echo ""

# Recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  💡 ${BLUE}Next Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$FIX_APPLIED" = "no" ]; then
    echo -e "${YELLOW}⚠ You need to apply the fix!${NC}"
    echo ""
    echo "1. Edit the config file:"
    echo "   sudo nano $CONFIG"
    echo ""
    
    if [ "$SERVER" = "nginx" ]; then
        echo "2. Add this INSIDE the 'server {' block:"
        echo ""
        echo "   location /_next/static {"
        if [ ! -z "$NEXT_PATH" ]; then
            echo "       alias $NEXT_PATH/static;"
        else
            echo "       alias /path/to/your/.next/static;"
        fi
        echo "       expires 1y;"
        echo "       add_header Cache-Control \"public, immutable\";"
        echo "   }"
        echo ""
        echo "3. Test and reload:"
        echo "   sudo nginx -t"
        echo "   sudo systemctl reload nginx"
    else
        echo "2. Add this at TOP of '<VirtualHost *:443>' block:"
        echo ""
        echo "   AllowEncodedSlashes NoDecode"
        echo "   ProxyPass /_next/static !"
        if [ ! -z "$NEXT_PATH" ]; then
            echo "   Alias /_next/static $NEXT_PATH/static"
        else
            echo "   Alias /_next/static /path/to/your/.next/static"
        fi
        echo ""
        echo "3. Test and reload:"
        echo "   sudo apachectl configtest"
        echo "   sudo systemctl reload apache2"
    fi
else
    echo -e "${GREEN}✓ Fix appears to be applied!${NC}"
    echo ""
    echo "If you're still seeing 400 errors, try:"
    echo ""
    echo "1. Clear browser cache (Ctrl+Shift+Delete)"
    echo "2. Hard refresh (Ctrl+Shift+R)"
    echo "3. Check browser console for errors"
    echo ""
    echo "4. Test from command line:"
    echo "   curl -I https://monsbah.com/_next/static/chunks/main-app-*.js"
    echo ""
    echo "5. Restart web server:"
    echo "   sudo systemctl restart $SERVER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 For detailed instructions, see: FIX-ON-SERVER.md"
echo ""
