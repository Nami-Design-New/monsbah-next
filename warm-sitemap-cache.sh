#!/bin/bash

# Sitemap Cache Warming Script
# This script hits all sitemap URLs to pre-populate the cache

echo "🔥 Warming up sitemap caches..."
echo "================================"

BASE_URL="${1:-http://localhost:3000}"

# All locales
LOCALES=("sa-ar" "sa-en" "kw-ar" "kw-en" "ae-ar" "ae-en" "bh-ar" "bh-en" "om-ar" "om-en" "qa-ar" "qa-en")

echo "📍 Base URL: $BASE_URL"
echo ""

# Function to hit URL and show status
hit_url() {
    local url=$1
    local name=$2
    echo -n "  ⏳ $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -m 60 "$url")
    
    if [ "$response" = "200" ]; then
        echo "✅ ($response)"
    else
        echo "❌ ($response)"
    fi
}

# 1. Hit root sitemap first
echo "1️⃣  Root Sitemap"
hit_url "$BASE_URL/sitemap.xml" "Root sitemap index"
echo ""

# 2. Hit global image sitemap
echo "2️⃣  Global Image Sitemap"
hit_url "$BASE_URL/sitemap-images.xml" "Global images"
echo ""

# 3. Hit each locale sitemap
for locale in "${LOCALES[@]}"; do
    echo "3️⃣  Locale: $locale"
    
    # Locale sitemap index
    hit_url "$BASE_URL/$locale/sitemap.xml" "Sitemap index"
    
    # Static pages
    hit_url "$BASE_URL/$locale/sitemap-static.xml" "Static pages"
    
    # Categories (might be chunked)
    hit_url "$BASE_URL/$locale/sitemap-categories0.xml" "Categories chunk 0"
    
    # Products (will be chunked)
    echo "  🛍️  Loading products chunks (this may take a while)..."
    for i in {0..4}; do
        hit_url "$BASE_URL/$locale/sitemap-products$i.xml" "Products chunk $i"
    done
    
    # Companies (will be chunked)
    echo "  🏢 Loading companies chunks..."
    for i in {0..2}; do
        hit_url "$BASE_URL/$locale/sitemap-companies$i.xml" "Companies chunk $i"
    done
    
    # Blogs
    hit_url "$BASE_URL/$locale/sitemap-blogs.xml" "Blogs"
    
    echo ""
done

echo "================================"
echo "✅ Cache warming complete!"
echo ""
echo "💡 The cache will expire in 5 minutes (300 seconds)."
echo "💡 For production, update CACHE_DURATION to 86400 (24 hours)."
