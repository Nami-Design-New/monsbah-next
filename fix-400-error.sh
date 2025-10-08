#!/bin/bash

# IMMEDIATE FIX for 400 Bad Request Error
# Run this script on your server: bash fix-400-error.sh

echo "🚨 Fixing 400 Bad Request Error for Next.js Chunks"
echo "=================================================="
echo ""

# Detect web server
if systemctl is-active --quiet nginx; then
    SERVER="nginx"
    echo "✓ Detected: Nginx"
elif systemctl is-active --quiet apache2; then
    SERVER="apache2"
    echo "✓ Detected: Apache"
else
    echo "❌ Could not detect web server (nginx or apache2)"
    echo "Please run manually:"
    echo "  systemctl status nginx"
    echo "  systemctl status apache2"
    exit 1
fi

echo ""
echo "Current server: $SERVER"
echo ""

# Backup existing config
echo "📋 Creating backup of current configuration..."
if [ "$SERVER" = "nginx" ]; then
    sudo cp /etc/nginx/sites-enabled/monsbah* /etc/nginx/sites-enabled/monsbah.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
else
    sudo cp /etc/apache2/sites-enabled/monsbah* /etc/apache2/sites-enabled/monsbah.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

echo "✓ Backup created"
echo ""

# Show current config location
echo "📂 Current configuration file:"
if [ "$SERVER" = "nginx" ]; then
    CONF_FILE=$(ls /etc/nginx/sites-enabled/*monsbah* 2>/dev/null | head -1)
else
    CONF_FILE=$(ls /etc/apache2/sites-enabled/*monsbah* 2>/dev/null | head -1)
fi

if [ -z "$CONF_FILE" ]; then
    echo "❌ Could not find configuration file"
    echo ""
    echo "Please locate your config manually:"
    if [ "$SERVER" = "nginx" ]; then
        echo "  ls /etc/nginx/sites-enabled/"
        echo "  ls /etc/nginx/sites-available/"
    else
        echo "  ls /etc/apache2/sites-enabled/"
        echo "  ls /etc/apache2/sites-available/"
    fi
    exit 1
fi

echo "Found: $CONF_FILE"
echo ""

# Check if fix already applied
echo "🔍 Checking if fix is already applied..."
if [ "$SERVER" = "nginx" ]; then
    if grep -q "location /_next/static" "$CONF_FILE"; then
        echo "✓ Fix might already be applied (found location block)"
    else
        echo "❌ Fix NOT found in config"
    fi
else
    if grep -q "AllowEncodedSlashes" "$CONF_FILE"; then
        echo "✓ Fix might already be applied (found AllowEncodedSlashes)"
    else
        echo "❌ Fix NOT found in config"
    fi
fi

echo ""
echo "=================================================="
echo "⚠️  MANUAL STEPS REQUIRED"
echo "=================================================="
echo ""

if [ "$SERVER" = "nginx" ]; then
    echo "1. Edit the Nginx config:"
    echo "   sudo nano $CONF_FILE"
    echo ""
    echo "2. Add this INSIDE the 'server {' block (after 'server_name' line):"
    echo ""
    cat << 'EOF'
    # Fix for 400 Bad Request on Next.js chunks
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
EOF
    echo ""
    echo "3. Test and reload Nginx:"
    echo "   sudo nginx -t"
    echo "   sudo systemctl reload nginx"
    echo ""
else
    echo "1. Edit the Apache config:"
    echo "   sudo nano $CONF_FILE"
    echo ""
    echo "2. Add this at the TOP of the <VirtualHost *:443> block:"
    echo ""
    cat << 'EOF'
    # Fix for 400 Bad Request on Next.js chunks
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
EOF
    echo ""
    echo "3. Test and reload Apache:"
    echo "   sudo apachectl configtest"
    echo "   sudo systemctl reload apache2"
    echo ""
fi

echo "=================================================="
echo "4. Verify files exist:"
echo "   ls -la /var/www/monsbah/.next/static/chunks/"
echo ""
echo "5. Test the fix:"
echo "   curl -I https://monsbah.com/_next/static/chunks/main-app-*.js"
echo "   (Should return 200 OK, not 400)"
echo ""
echo "=================================================="
echo ""
echo "📖 For detailed instructions, see:"
echo "   - QUICK-FIX.md"
echo "   - README-SERVER-FIX.md"
echo ""
