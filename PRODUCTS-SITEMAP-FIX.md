# Products Sitemap Timeout Fix

## Problem
`/kw-ar/products/sitemap0.xml` returns **504 Gateway Timeout**

## Root Cause
- Products API is extremely slow (12+ minutes for 500 products)
- Too many API calls needed to generate sitemap
- Dynamic generation causes timeout on every request

## Solutions Implemented

### 1. Reduced Products Per Sitemap
- Changed from **5000** to **500** products per sitemap
- Reduced from 100 pages to 10 pages max
- Less API calls = faster generation

### 2. Improved Timeout Handling
- Total timeout: **15 seconds** (down from 30s)
- Per-request timeout: **3 seconds** (down from 10s)
- Fast-fail after 3 consecutive failures

### 3. Sequential Instead of Parallel
- Changed from parallel batch requests to sequential
- Prevents overwhelming the slow API
- Better error handling

### 4. Better Caching
- Cache for **1 hour** (3600s)
- Stale-while-revalidate for **24 hours**
- Reduces repeated slow generations

### 5. Graceful Degradation
- Returns empty sitemap on error instead of 500
- Prevents search engine crawl failures
- Logs errors for debugging

## Code Changes

### Before:
```javascript
const MAX_URLS_PER_SITEMAP = 5000;
const PARALLEL_REQUESTS = 5;
const REQUEST_TIMEOUT = 30000;
```

### After:
```javascript
const MAX_URLS_PER_SITEMAP = 500;
const REQUEST_TIMEOUT = 15000;
// Sequential requests with 3s timeout each
```

## Alternative Solutions (If Still Slow)

### Option 1: Pre-generate Sitemaps
Create a cron job to generate sitemaps in advance:
```bash
# Every hour
0 * * * * curl https://monsbah.com/kw-ar/products/sitemap0.xml
```

### Option 2: Static Generation with ISR
Change to static generation with revalidation:
```javascript
export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static";
```

### Option 3: Database-Direct Query
Skip the API and query products directly from database:
```javascript
import { db } from "@/lib/db";

const products = await db.products.findMany({
  where: { country_slug, published: true },
  take: 500,
  orderBy: { updated_at: 'desc' }
});
```

### Option 4: Paginated Index
Instead of one large sitemap, create an index with multiple smaller sitemaps:
```xml
<!-- /kw-ar/products/sitemap.xml -->
<sitemapindex>
  <sitemap>
    <loc>https://monsbah.com/kw-ar/products/sitemap-0-100.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://monsbah.com/kw-ar/products/sitemap-100-200.xml</loc>
  </sitemap>
  <!-- 100 products per sitemap = faster generation -->
</sitemapindex>
```

## Testing

```bash
# Test with timing
time curl -s http://localhost:3000/kw-ar/products/sitemap0.xml | head -20

# Check headers
curl -I http://localhost:3000/kw-ar/products/sitemap0.xml

# Monitor generation time
curl -s -w "Time: %{time_total}s\n" http://localhost:3000/kw-ar/products/sitemap0.xml > /dev/null
```

## Recommendations

1. **Short Term**: Use current optimizations (500 products, better caching)
2. **Medium Term**: Implement pre-generation with cron jobs
3. **Long Term**: Optimize the products API or use direct database queries

## Expected Results

- **Before**: 12+ minutes, 504 timeout
- **After**: < 30 seconds, 200 OK with cached response
- **Cached**: < 1 second

## Notes

- If API is still too slow, consider using Option 3 (database-direct)
- Monitor X-Generation-Time header to track performance
- Consider adding Redis caching layer for frequently accessed sitemaps

---
**Status:** ⚠️ Implemented but API performance needs improvement
**Date:** October 19, 2025
