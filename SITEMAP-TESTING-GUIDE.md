# 🧪 Sitemap Testing Guide

## Quick Test Commands

### Start Development Server
```bash
npm run dev
# Wait for: "Ready in X.XXs"
# Server should be at: http://localhost:3000
```

### Test Each Sitemap Type

#### 1️⃣ Test Companies Sitemap
```bash
# Option A: In Browser
open http://localhost:3000/kw-ar/companies/sitemap-v2?id=0

# Option B: Using curl
curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0"
```

**Expected Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://monsbah.com/kw-ar/company-details/company-name</loc>
    <lastmod>2025-10-06T10:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ...
</urlset>
```

**Console Logs to Watch:**
```
[Companies Sitemap] Generating chunk 0 for locale kw-ar
[Companies Sitemap] No cache found, generating from scratch
[Companies Sitemap] Fetching page 1...
[Companies Sitemap] Fetched X companies from page 1. Total: X
[Companies Sitemap] Total companies fetched: X
[Companies Sitemap] Initial cache created: { totalUrls: X, chunks: 1 }
```

---

#### 2️⃣ Test Products Sitemap
```bash
# In Browser
open http://localhost:3000/kw-ar/products/sitemap-v2?id=0

# Using curl
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=0"
```

**Expected Console Logs:**
```
[Products Sitemap] Generating chunk 0 for locale kw-ar
[Products Sitemap] No cache found, generating from scratch
[Products Sitemap] Fetching products page 1...
[Products Sitemap] Fetched X products. Total so far: X
[Products Sitemap] Total products fetched: X
[Products Sitemap] Initial cache created
```

---

#### 3️⃣ Test Blogs Sitemap
```bash
# In Browser
open http://localhost:3000/kw-ar/blogs/sitemap-v2?id=0

# Using curl
curl "http://localhost:3000/kw-ar/blogs/sitemap-v2?id=0"
```

**Expected Console Logs:**
```
[Blogs Sitemap] Generating chunk 0 for locale kw-ar
[Blogs Sitemap] No cache found, generating from scratch
[Blogs Sitemap] Initial cache created: { totalUrls: X, chunks: Y }
```

---

#### 4️⃣ Check Cache Statistics
```bash
# Get cache stats
curl http://localhost:3000/api/sitemap/invalidate

# Or in browser
open http://localhost:3000/api/sitemap/invalidate
```

**Before Any Sitemaps Generated:**
```json
{
  "stats": [],
  "totalFiles": 0,
  "totalSize": 0,
  "totalSizeMB": "0.00"
}
```

**After Generating Sitemaps:**
```json
{
  "stats": [
    {
      "type": "companies",
      "locale": "kw-ar",
      "file": "companies-kw-ar.json",
      "urls": 85,
      "chunks": 1,
      "size": "14.72 KB",
      "lastModified": "2025-10-06T12:34:56.789Z"
    },
    {
      "type": "products",
      "locale": "kw-ar",
      "file": "products-kw-ar.json",
      "urls": 1250,
      "chunks": 1,
      "size": "215.43 KB",
      "lastModified": "2025-10-06T12:35:12.345Z"
    }
  ],
  "totalFiles": 2,
  "totalSize": 235673,
  "totalSizeMB": "0.22"
}
```

---

## Test All Locales

Test each country-locale combination:

```bash
# Kuwait (Arabic)
curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0"

# Kuwait (English)
curl "http://localhost:3000/kw-en/companies/sitemap-v2?id=0"

# Saudi Arabia (Arabic)
curl "http://localhost:3000/sa-ar/companies/sitemap-v2?id=0"

# UAE (Arabic)
curl "http://localhost:3000/ae-ar/companies/sitemap-v2?id=0"

# All 12 locales:
# sa-ar, sa-en, kw-ar, kw-en, ae-ar, ae-en, 
# bh-ar, bh-en, om-ar, om-en, qa-ar, qa-en
```

---

## Test Cache Behavior

### Test 1: Fresh Cache Generation
```bash
# 1. Delete cache (if exists)
rm -rf .sitemap-cache/companies-kw-ar.json

# 2. Generate sitemap (slow - fetches all data)
time curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0" > /dev/null

# Expected: 10-30 seconds
```

### Test 2: Cached Response
```bash
# 1. Generate sitemap again (fast - uses cache)
time curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0" > /dev/null

# Expected: 0.1-0.2 seconds (50-200ms)
# Console: "[Companies Sitemap] Using cached data"
```

### Test 3: Incremental Update
```bash
# 1. Wait for cache to expire (or modify lastGenerated in cache file)
# Edit: .sitemap-cache/companies-kw-ar.json
# Change: lastGenerated to 13 hours ago

# 2. Request sitemap again
curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0" > /dev/null

# Console should show:
# "[Companies Sitemap] Cache expired, performing incremental update"
# "Changes detected: { added: X, updated: Y, deleted: Z }"
```

---

## Test Chunking (Large Datasets)

For testing with large datasets that need multiple chunks:

```bash
# If you have 150,000+ URLs, they'll be split into chunks
# Chunk 0: URLs 1-50,000
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=0"

# Chunk 1: URLs 50,001-100,000
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=1"

# Chunk 2: URLs 100,001-150,000
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=2"

# Invalid chunk (404)
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=99"
# Expected: "Chunk not found"
```

**Response Headers to Check:**
```
X-Sitemap-Chunk: 0/3          # Chunk 0 of 3 total
X-Sitemap-URLs: 50000         # 50,000 URLs in this chunk
X-Sitemap-Size: 8589934       # ~8.5 MB
```

---

## Test Cache Invalidation

### Invalidate Specific Type & Locale
```bash
# Invalidate companies for kw-ar
curl -X POST "http://localhost:3000/api/sitemap/invalidate?type=companies&locale=kw-ar"

# Expected Response:
{
  "success": true,
  "message": "Cache invalidated for companies-kw-ar",
  "filesDeleted": ["companies-kw-ar.json"]
}
```

### Invalidate All Caches
```bash
# Clear everything
curl -X POST "http://localhost:3000/api/sitemap/invalidate?type=all"

# Expected:
{
  "success": true,
  "message": "All caches invalidated",
  "filesDeleted": [
    "companies-kw-ar.json",
    "products-kw-ar.json",
    "blogs-kw-ar.json",
    ...
  ]
}
```

### Invalidate by Type (All Locales)
```bash
# Clear all product caches
curl -X POST "http://localhost:3000/api/sitemap/invalidate?type=products"

# Expected:
{
  "success": true,
  "message": "Cache invalidated for type: products",
  "filesDeleted": [
    "products-kw-ar.json",
    "products-sa-ar.json",
    "products-ae-ar.json",
    ...
  ]
}
```

---

## Verify Cache Files

### Check Cache Directory
```bash
# List all cache files
ls -lh .sitemap-cache/

# Expected output:
# companies-kw-ar.json   (15 KB)
# companies-sa-ar.json   (20 KB)
# products-kw-ar.json    (215 KB)
# blogs-kw-ar.json       (45 KB)
```

### Inspect Cache Content
```bash
# View cache structure
cat .sitemap-cache/companies-kw-ar.json | jq

# Expected structure:
{
  "chunks": [
    [
      {
        "url": "https://monsbah.com/kw-ar/company-details/...",
        "lastModified": "2025-10-06T...",
        "changeFrequency": "monthly",
        "priority": 0.7
      },
      ...
    ]
  ],
  "stats": {
    "totalUrls": 85,
    "totalChunks": 1,
    "largestChunk": 85,
    "smallestChunk": 85
  },
  "lastGenerated": "2025-10-06T12:34:56.789Z",
  "locale": "kw-ar"
}
```

---

## Troubleshooting

### Issue: "Chunk not found"
**Possible Causes:**
1. ✅ Server not running → `npm run dev`
2. ✅ Wrong URL format → Use `?id=0` not `?chunk=0`
3. ✅ Cache empty and no data fetched → Check API connection

### Issue: Empty XML (No URLs)
**Check:**
```bash
# 1. Check server logs for errors
# Look for: "Error fetching companies"

# 2. Verify API returns data
curl "YOUR_API_URL/client/companies?country_slug=kw"

# 3. Check cache file
cat .sitemap-cache/companies-kw-ar.json | jq '.stats.totalUrls'
# Should be > 0
```

### Issue: Very Slow First Request
**This is Normal!** First request:
- Fetches ALL data from API
- Processes and chunks it
- Saves to cache
- Can take 10-60 seconds

**Subsequent requests** will be 100-1000x faster (50-200ms)

### Issue: Cache Not Updating
**Check TTL:**
- Products: 6 hours
- Blogs: 12 hours  
- Companies: 12 hours

**Force Update:**
```bash
# Delete cache file
rm .sitemap-cache/companies-kw-ar.json

# Or use API
curl -X POST "http://localhost:3000/api/sitemap/invalidate?type=companies&locale=kw-ar"
```

---

## Performance Benchmarks

### Expected Response Times

| Scenario | Expected Time | What It Does |
|----------|--------------|--------------|
| First request (no cache) | 10-60s | Fetches all data, creates cache |
| Cached request | 50-200ms | Reads from cache, generates XML |
| Incremental update | 3-15s | Fetches new data, merges changes |
| Cache invalidation | 10-50ms | Deletes cache file |

### Monitor Performance
```bash
# Time first request
time curl -s "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0" > /dev/null

# Time cached request
time curl -s "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0" > /dev/null
```

---

## Automated Testing Script

Create `test-sitemaps.sh`:
```bash
#!/bin/bash

echo "🧪 Testing Sitemap System..."
echo ""

# Test each sitemap type
for type in companies products blogs; do
  echo "Testing $type sitemap..."
  response=$(curl -s -w "%{http_code}" "http://localhost:3000/kw-ar/${type}/sitemap-v2?id=0")
  status="${response: -3}"
  
  if [ "$status" == "200" ]; then
    echo "✅ $type: OK"
  else
    echo "❌ $type: FAILED (Status: $status)"
  fi
done

echo ""
echo "📊 Cache Statistics:"
curl -s "http://localhost:3000/api/sitemap/invalidate" | jq

echo ""
echo "✅ All tests complete!"
```

Run it:
```bash
chmod +x test-sitemaps.sh
./test-sitemaps.sh
```

---

## Production Checklist

Before deploying to production:

- [ ] Test all 3 sitemap types (companies, products, blogs)
- [ ] Test all 12 locales
- [ ] Verify cache directory is created (`.sitemap-cache/`)
- [ ] Verify cache files are being generated
- [ ] Test cache invalidation API
- [ ] Set `SITEMAP_API_KEY` environment variable
- [ ] Add `.sitemap-cache/` to `.gitignore` ✅
- [ ] Update main sitemap index at `/src/app/sitemap.xml/route.js`
- [ ] Test with large datasets (50K+ URLs)
- [ ] Monitor server logs for errors
- [ ] Set up automated cache invalidation webhooks

---

**Created:** October 6, 2025  
**Status:** Ready for Testing 🚀
