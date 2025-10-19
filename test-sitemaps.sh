#!/bin/bash

echo "Testing Sitemaps..."
echo "==================="
echo ""

echo "1. Testing /sitemap.xml"
curl -s -I http://localhost:3000/sitemap.xml | grep -E "HTTP|Content-Type|Cache-Control"
echo ""

echo "2. Testing /robots.txt"
curl -s -I http://localhost:3000/robots.txt | grep -E "HTTP|Content-Type|Cache-Control"
echo ""

echo "3. Testing /kw-ar/sitemap.xml"
curl -s -I http://localhost:3000/kw-ar/sitemap.xml | grep -E "HTTP|Content-Type|Cache-Control"
echo ""

echo "4. Sample content from /kw-ar/sitemap.xml:"
curl -s http://localhost:3000/kw-ar/sitemap.xml | head -15
echo ""

echo "5. Sample content from /sitemap.xml:"
curl -s http://localhost:3000/sitemap.xml | head -15
