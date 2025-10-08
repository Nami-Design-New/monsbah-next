# Quick Start: Intelligent Sitemap System

## 🚀 Installation & Setup (5 minutes)

### Step 1: Verify Files Are Created
All necessary files have been created:
- ✅ `src/utils/sitemap-manager.js` - Core utilities
- ✅ `src/app/[country-locale]/products/sitemap-v2/route.js` - Smart product sitemap
- ✅ `src/app/[country-locale]/blogs/sitemap-v2/route.js` - Smart blog sitemap
- ✅ `src/app/[country-locale]/companies/sitemap-v2/route.js` - Smart company sitemap
- ✅ `src/app/api/sitemap/invalidate/route.js` - Cache management API
- ✅ `.gitignore` - Updated with cache directory

### Step 2: Create Cache Directory (Optional)
The system creates it automatically, but you can pre-create it:

```bash
mkdir -p .sitemap-cache
chmod 755 .sitemap-cache
```

### Step 3: Set API Key (Optional)
For cache invalidation API protection:

```bash
# Add to .env.local
echo "SITEMAP_API_KEY=your-secret-key-123" >> .env.local
```

### Step 4: Test It!

```bash
# Start your dev server
npm run dev

# Test product sitemap
curl http://localhost:3000/kw-ar/products/sitemap-v2?id=0

# Test blog sitemap
curl http://localhost:3000/kw-ar/blogs/sitemap-v2?id=0

# Check cache stats
curl http://localhost:3000/api/sitemap/invalidate
```

## 📊 How It Works

### First Time Access
```
User requests sitemap
    ↓
No cache found
    ↓
Fetch ALL products from API (may take 30-60 seconds)
    ↓
Convert to sitemap entries
    ↓
Chunk into files (50,000 URLs or 50MB max each)
    ↓
Save to .sitemap-cache/products-kw-ar.json
    ↓
Return requested chunk
```

### Subsequent Access (Cache Fresh < 6 hours)
```
User requests sitemap
    ↓
Cache found and fresh
    ↓
Load from cache (INSTANT - 50ms)
    ↓
Return requested chunk
```

### Cache Expired (> 6 hours)
```
User requests sitemap
    ↓
Cache found but expired
    ↓
Load old cache + Fetch new products (smart!)
    ↓
Compare: Find what's added/updated/deleted
    ↓
Merge changes into existing chunks
    ↓
Save updated cache
    ↓
Return requested chunk
```

## 🎯 Key Benefits

### ✅ Automatic Chunking
- If you have 150,000 products → Creates 3 chunks automatically
- Chunk 0: URLs 1-50,000
- Chunk 1: URLs 50,001-100,000
- Chunk 2: URLs 100,001-150,000

### ✅ Efficient Updates
**Instead of:**
- Fetching 150,000 products every time
- Taking 60+ seconds per request
- High database load

**You get:**
- Instant responses from cache (50ms)
- Only fetches when cache expires
- Smart incremental updates

### ✅ Change Detection
When cache expires, it detects:
- **Added:** New products/blogs/companies
- **Updated:** Modified content (changed lastmod date)
- **Deleted:** Removed items

Then merges only the changes!

## 🔧 Daily Operations

### Check Cache Status
```bash
curl http://localhost:3000/api/sitemap/invalidate

# Shows:
# - How many cache files exist
# - Total URLs cached
# - Cache size
# - Last generation time
```

### Force Refresh (When Needed)
```bash
# Refresh all caches
curl -X POST http://localhost:3000/api/sitemap/invalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "all", "apiKey": "your-secret-key-123"}'

# Refresh only products
curl -X POST http://localhost:3000/api/sitemap/invalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "products", "apiKey": "your-secret-key-123"}'

# Refresh specific locale
curl -X POST http://localhost:3000/api/sitemap/invalidate \
  -H "Content-Type: application/json" \
  -d '{"type": "products", "locale": "kw-ar", "apiKey": "your-secret-key-123"}'
```

### When to Invalidate Cache
Trigger cache invalidation after:
- ✅ Bulk product imports
- ✅ Mass updates
- ✅ Major content changes
- ✅ Database migrations
- ✅ Before SEO audits

## 📈 Monitoring

### Response Headers
Every sitemap response includes helpful headers:

```bash
curl -I http://localhost:3000/kw-ar/products/sitemap-v2?id=0

# X-Sitemap-Chunk: 0/3          → You're viewing chunk 0 of 3 total
# X-Sitemap-URLs: 50000          → This chunk has 50,000 URLs
# X-Sitemap-Size: 8388608        → Size is 8 MB
# Cache-Control: s-maxage=21600  → Cached for 6 hours
```

### Server Logs
Watch for these helpful logs:

```
✅ [Products Sitemap] Using cached data (age: 45 minutes)
✅ [Products Sitemap] Chunk 0 stats: { urls: 50000, sizeMB: '8.00' }

🔄 [Products Sitemap] Cache expired, performing incremental update
🔄 [Products Sitemap] Changes: { added: 150, updated: 50, deleted: 25 }

🆕 [Products Sitemap] No cache found, generating from scratch
🆕 [Products Sitemap] Initial cache created: { totalUrls: 75000, totalChunks: 2 }
```

## 🎓 Example Scenarios

### Scenario 1: New Store (No Products Yet)
```
1. First request: Generates empty sitemap, caches it
2. Add 100 products
3. Next request (6+ hours later): Detects 100 added products
4. Updates cache efficiently
```

### Scenario 2: Growing Store (5,000 → 60,000 Products)
```
1. Initial: Single chunk with 5,000 URLs
2. Grow to 60,000 products
3. Cache expires → Detects 55,000 added products
4. Automatically creates 2 chunks (50K + 10K)
5. Future updates stay in 2 chunks
```

### Scenario 3: Large Store (200,000 Products)
```
1. Initial generation: Creates 4 chunks automatically
   - Chunk 0: 50,000 URLs
   - Chunk 1: 50,000 URLs
   - Chunk 2: 50,000 URLs
   - Chunk 3: 50,000 URLs
2. Daily operations: Only updates changed entries
3. Maintains 4 chunks unless total URLs change significantly
```

## ⚙️ Advanced Configuration

### Adjust Cache Lifetime
Edit in route files:

```javascript
// For frequently updated content (products)
const MAX_CACHE_AGE = 6 * 60 * 60 * 1000; // 6 hours

// For rarely updated content (blogs)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
```

### Adjust Chunk Limits
Edit `src/utils/sitemap-manager.js`:

```javascript
// Default (Google's limits)
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024; // 50 MB

// Conservative (more chunks, smaller files)
const MAX_URLS_PER_SITEMAP = 25000;
const MAX_BYTES_PER_SITEMAP = 25 * 1024 * 1024; // 25 MB
```

## 🚨 Troubleshooting

### Cache Not Working?
```bash
# Check if directory exists and is writable
ls -la .sitemap-cache/
# Should show .json files

# Check logs for errors
npm run dev
# Look for "[Sitemap]" log messages
```

### Chunks Not Creating?
```bash
# Check actual URL count
curl http://localhost:3000/api/sitemap/invalidate

# If totalUrls > 50,000 but only 1 chunk:
# - Cache might be corrupted
# - Force invalidate and regenerate
```

### Slow Performance?
```bash
# Check cache age
curl http://localhost:3000/api/sitemap/invalidate

# If cache is old:
# - System is fetching fresh data
# - This is expected behavior
# - Subsequent requests will be fast
```

## 🎉 Success Indicators

You'll know it's working when:
- ✅ First request takes 30-60 seconds (generating cache)
- ✅ Subsequent requests return in 50-200ms (using cache)
- ✅ `.sitemap-cache/` directory contains .json files
- ✅ Server logs show "Using cached data"
- ✅ Response headers include "X-Sitemap-Chunk"

## 📚 Next Steps

1. **Test in development** - Access all sitemap routes
2. **Monitor logs** - Watch cache behavior
3. **Deploy to production** - Let it build cache
4. **Set up monitoring** - Track cache hits/misses
5. **Schedule invalidation** - Automate cache refresh

## 🆘 Need Help?

Check the full documentation:
- `INTELLIGENT-SITEMAP-GUIDE.md` - Complete technical guide
- `SITEMAP-README.md` - Original sitemap documentation
- `BLOG-SEO-GUIDE.md` - Blog-specific SEO features

Your intelligent sitemap system is ready! 🚀

The system will automatically:
- ✅ Chunk files when they exceed 50,000 URLs or 50MB
- ✅ Cache results for fast responses
- ✅ Detect and merge changes incrementally
- ✅ Create new files only when necessary
- ✅ Update existing files with changes
