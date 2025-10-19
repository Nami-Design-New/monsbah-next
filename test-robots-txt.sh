#!/bin/bash

echo "Testing Locale-Specific Robots.txt Files"
echo "========================================"
echo ""

LOCALES=("sa-ar" "sa-en" "kw-ar" "kw-en" "ae-ar" "ae-en" "bh-ar" "bh-en" "om-ar" "om-en" "qa-ar" "qa-en")
BASE_URL="http://localhost:3000"

for locale in "${LOCALES[@]}"; do
  echo "📍 Testing /$locale/robots.txt"
  
  # Test HTTP status
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$locale/robots.txt")
  
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ Status: $STATUS"
    
    # Get first line (should show locale)
    FIRST_LINE=$(curl -s "$BASE_URL/$locale/robots.txt" | head -1)
    echo "   📄 $FIRST_LINE"
    
    # Count sitemaps
    SITEMAP_COUNT=$(curl -s "$BASE_URL/$locale/robots.txt" | grep -c "Sitemap:")
    echo "   🗺️  Sitemaps found: $SITEMAP_COUNT"
    
    # Show locale-specific sitemap
    LOCALE_SITEMAP=$(curl -s "$BASE_URL/$locale/robots.txt" | grep "Sitemap:.*/$locale/sitemap.xml")
    echo "   🔗 $LOCALE_SITEMAP"
  else
    echo "   ❌ Status: $STATUS (Expected 200)"
  fi
  
  echo ""
done

echo ""
echo "Testing Root Robots.txt"
echo "======================="
echo ""

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")
echo "📍 Status: $STATUS"

if [ "$STATUS" = "200" ]; then
  echo "✅ Root robots.txt is working"
  SITEMAP_COUNT=$(curl -s "$BASE_URL/robots.txt" | grep -c "Sitemap:")
  echo "🗺️  Total sitemaps: $SITEMAP_COUNT"
else
  echo "❌ Root robots.txt failed"
fi

echo ""
echo "✅ All tests completed!"
