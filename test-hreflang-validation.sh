#!/bin/bash

# Hreflang Validation Script
# This script tests the live site for proper hreflang implementation

echo "================================================"
echo "Hreflang Validation Test"
echo "================================================"
echo ""

# Base URL - change this to test different environments
BASE_URL="${1:-https://monsbah.com}"

echo "Testing site: $BASE_URL"
echo ""

# Function to test a URL and extract hreflang tags
test_hreflang() {
    local url=$1
    local page_name=$2
    
    echo "Testing: $page_name"
    echo "URL: $url"
    echo "----------------------------------------"
    
    # Fetch the page and extract hreflang tags
    response=$(curl -s "$url")
    
    # Count total hreflang tags
    total_tags=$(echo "$response" | grep -c 'hreflang=')
    echo "Total hreflang tags found: $total_tags"
    
    # Check for uppercase country codes
    uppercase_count=$(echo "$response" | grep -oE 'hreflang="[a-z]{2}-[A-Z]{2}"' | wc -l | tr -d ' ')
    echo "Tags with UPPERCASE country codes: $uppercase_count"
    
    # Check for x-default
    xdefault=$(echo "$response" | grep -c 'hreflang="x-default"')
    if [ "$xdefault" -eq 1 ]; then
        echo "✓ x-default tag: Present and unique"
        # Extract x-default URL
        xdefault_url=$(echo "$response" | grep 'hreflang="x-default"' | grep -oE 'href="[^"]+' | cut -d'"' -f2)
        echo "  x-default URL: $xdefault_url"
    elif [ "$xdefault" -eq 0 ]; then
        echo "✗ x-default tag: Missing"
    else
        echo "✗ x-default tag: Multiple found ($xdefault)"
    fi
    
    # Check for canonical tag
    canonical=$(echo "$response" | grep -c '<link rel="canonical"')
    if [ "$canonical" -ge 1 ]; then
        echo "✓ Canonical tag: Present"
        canonical_url=$(echo "$response" | grep '<link rel="canonical"' | grep -oE 'href="[^"]+' | cut -d'"' -f2 | head -1)
        echo "  Canonical URL: $canonical_url"
    else
        echo "✗ Canonical tag: Missing"
    fi
    
    # Check HTML lang attribute
    html_lang=$(echo "$response" | grep -oE '<html[^>]+lang="[^"]+"' | grep -oE 'lang="[^"]+"' | cut -d'"' -f2)
    if [ -n "$html_lang" ]; then
        echo "✓ HTML lang attribute: $html_lang"
    else
        echo "✗ HTML lang attribute: Missing"
    fi
    
    # List all hreflang tags
    echo ""
    echo "Hreflang tags found:"
    echo "$response" | grep 'hreflang=' | sed 's/.*hreflang="\([^"]*\)".*href="\([^"]*\)".*/  \1 -> \2/' | head -15
    
    echo ""
    echo "================================================"
    echo ""
}

# Test different pages
echo "1. Testing Homepage"
echo "================================================"
test_hreflang "$BASE_URL/kw-ar/" "Homepage (Kuwait Arabic)"

echo "2. Testing Categories Page"
echo "================================================"
test_hreflang "$BASE_URL/kw-ar/categories" "Categories Page"

echo "3. Testing English Version"
echo "================================================"
test_hreflang "$BASE_URL/sa-en/" "Homepage (Saudi English)"

echo "4. Testing Another Country"
echo "================================================"
test_hreflang "$BASE_URL/ae-ar/" "Homepage (UAE Arabic)"

echo ""
echo "================================================"
echo "Validation Complete!"
echo "================================================"
echo ""
echo "Expected Results:"
echo "- 13 total hreflang tags per page (12 locales + 1 x-default)"
echo "- All country codes should be UPPERCASE (ar-KW not ar-kw)"
echo "- Exactly 1 x-default tag per page"
echo "- x-default should point to root URL or path without locale"
echo "- HTML lang attribute should match page locale"
echo ""
