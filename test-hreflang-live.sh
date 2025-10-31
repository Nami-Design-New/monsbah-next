#!/bin/bash

# Hreflang Live Testing Script
# Tests the actual running Next.js application

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        HREFLANG LIVE TESTING SCRIPT                        ║"
echo "║        Testing http://localhost:3000                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Function to test a page
test_page() {
    local page_name=$1
    local url=$2
    local expected_count=$3
    
    echo -n "Testing $page_name... "
    
    # Get the page and count hreflang tags
    count=$(curl -s "$url" | grep -c 'hreflang=')
    
    if [ "$count" -eq "$expected_count" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($count tags)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_count, got $count)"
        return 1
    fi
}

# Function to check if server is running
check_server() {
    if curl -s --head "$BASE_URL" | grep "200 OK" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Check if development server is running
echo "Checking if server is running..."
if ! check_server; then
    echo -e "${RED}❌ Server not running at $BASE_URL${NC}"
    echo "Please start the development server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test counter
total_tests=0
passed_tests=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TESTING GLOBAL PAGES (Expected: 13 tags)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test Home Pages
for locale in "kw-ar" "kw-en" "sa-ar" "sa-en"; do
    ((total_tests++))
    if test_page "Home ($locale)" "$BASE_URL/$locale/" 13; then
        ((passed_tests++))
    fi
done

# Test Categories
for locale in "kw-ar" "sa-en"; do
    ((total_tests++))
    if test_page "Categories ($locale)" "$BASE_URL/$locale/categories" 13; then
        ((passed_tests++))
    fi
done

# Test Companies
for locale in "kw-ar" "ae-en"; do
    ((total_tests++))
    if test_page "Companies ($locale)" "$BASE_URL/$locale/companies" 13; then
        ((passed_tests++))
    fi
done

# Test Sections
((total_tests++))
if test_page "Sections (kw-ar)" "$BASE_URL/kw-ar/sections" 13; then
    ((passed_tests++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DETAILED HREFLANG INSPECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get and display hreflang tags from home page
echo "Fetching hreflang tags from Home Page (kw-ar)..."
echo ""
curl -s "$BASE_URL/kw-ar/" | grep 'hreflang=' | sed 's/.*hreflang="/  /' | sed 's/".*//' | while read line; do
    echo "  ✓ $line"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VALIDATION CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for x-default
echo -n "Checking for x-default tag... "
if curl -s "$BASE_URL/kw-ar/" | grep -q 'hreflang="x-default"'; then
    echo -e "${GREEN}✅ FOUND${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ NOT FOUND${NC}"
fi
((total_tests++))

# Check for self-referencing
echo -n "Checking for self-referencing (ar-kw)... "
if curl -s "$BASE_URL/kw-ar/" | grep -q 'hreflang="ar-kw"'; then
    echo -e "${GREEN}✅ FOUND${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ NOT FOUND${NC}"
fi
((total_tests++))

# Check for absolute URLs
echo -n "Checking for absolute URLs... "
if curl -s "$BASE_URL/kw-ar/" | grep 'hreflang=' | grep -q 'https://'; then
    echo -e "${GREEN}✅ FOUND${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ NOT FOUND (URLs should be absolute)${NC}"
fi
((total_tests++))

# Check for lowercase hreflang values
echo -n "Checking for lowercase hreflang values... "
uppercase_count=$(curl -s "$BASE_URL/kw-ar/" | grep 'hreflang=' | grep -c '[A-Z]')
if [ "$uppercase_count" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL LOWERCASE${NC}"
    ((passed_tests++))
else
    echo -e "${RED}❌ FOUND $uppercase_count UPPERCASE${NC}"
fi
((total_tests++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

percentage=$((passed_tests * 100 / total_tests))

echo "Total Tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $((total_tests - passed_tests))"
echo "Success Rate: $percentage%"

if [ "$passed_tests" -eq "$total_tests" ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           🎉 ALL TESTS PASSED! 🎉                          ║${NC}"
    echo -e "${GREEN}║     Your hreflang implementation is working correctly!     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║           ⚠️  SOME TESTS FAILED ⚠️                          ║${NC}"
    echo -e "${YELLOW}║   Please review the errors above and fix the issues.      ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Manually inspect pages in browser (View Source)"
echo "2. Use browser DevTools console to list hreflang tags"
echo "3. Test with online validation tools"
echo "4. Check Google Search Console after deployment"
echo ""
echo "For more testing methods, see: HREFLANG_TESTING_GUIDE.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
