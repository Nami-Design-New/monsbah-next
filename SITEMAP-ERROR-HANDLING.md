# Enhanced Error Handling for Sitemap Chunks

## ✨ What Was Improved

Previously, when requesting an invalid chunk ID, the sitemap would return a plain text error:
```
Chunk not found
```

Now, it returns a **helpful JSON response** with detailed information!

---

## 📊 New Error Response Format

### Example: Requesting Invalid Chunk

**Request:**
```bash
GET http://localhost:3000/kw-ar/companies/sitemap-v2?id=1
```

**Response (404):**
```json
{
  "error": "Chunk not found",
  "requestedChunk": 1,
  "availableChunks": 1,
  "message": "Valid chunk IDs are 0 to 0",
  "totalUrls": 45,
  "locale": "kw-ar",
  "examples": [
    "https://monsbah.com/kw-ar/companies/sitemap-v2?id=0"
  ]
}
```

**Response Headers:**
```
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=UTF-8
X-Total-Chunks: 1
X-Requested-Chunk: 1
X-Total-URLs: 45
```

---

## 🎯 Benefits

### 1. **Developer-Friendly** 🛠️
- Clear error messages
- Shows valid chunk IDs
- Provides example URLs
- Includes helpful metadata

### 2. **Better Debugging** 🔍
- Know exactly how many chunks exist
- See total URLs available
- Understand the sitemap structure
- Quick copy-paste examples

### 3. **API Consistency** 📐
- JSON format for programmatic access
- Structured error responses
- Informative HTTP headers
- Machine-readable data

---

## 📖 Usage Examples

### Scenario 1: Small Dataset (1 Chunk)

**Companies Sitemap with 45 companies:**

```bash
# ✅ Valid - Chunk 0
curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0"
# Returns: XML sitemap with 45 companies

# ❌ Invalid - Chunk 1 doesn't exist
curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=1"
# Returns JSON:
{
  "error": "Chunk not found",
  "requestedChunk": 1,
  "availableChunks": 1,
  "message": "Valid chunk IDs are 0 to 0",
  "totalUrls": 45,
  "locale": "kw-ar",
  "examples": [
    "https://monsbah.com/kw-ar/companies/sitemap-v2?id=0"
  ]
}
```

---

### Scenario 2: Large Dataset (3 Chunks)

**Products Sitemap with 125,000 products:**

```bash
# ✅ Valid chunks
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=0"  # Products 1-50,000
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=1"  # Products 50,001-100,000
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=2"  # Products 100,001-125,000

# ❌ Invalid - Chunk 3 doesn't exist
curl "http://localhost:3000/kw-ar/products/sitemap-v2?id=3"
# Returns JSON:
{
  "error": "Chunk not found",
  "requestedChunk": 3,
  "availableChunks": 3,
  "message": "Valid chunk IDs are 0 to 2",
  "totalUrls": 125000,
  "locale": "kw-ar",
  "examples": [
    "https://monsbah.com/kw-ar/products/sitemap-v2?id=0"
  ]
}
```

---

### Scenario 3: Programmatic Access

**JavaScript/TypeScript:**
```typescript
async function getSitemapChunks(locale: string, type: string) {
  const chunks = [];
  let chunkId = 0;
  
  while (true) {
    const response = await fetch(
      `https://monsbah.com/${locale}/${type}/sitemap-v2?id=${chunkId}`
    );
    
    if (response.status === 404) {
      // Parse the helpful error response
      const error = await response.json();
      console.log(`Found ${error.availableChunks} chunks with ${error.totalUrls} URLs`);
      break;
    }
    
    if (response.ok) {
      const xml = await response.text();
      chunks.push(xml);
      chunkId++;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  }
  
  return chunks;
}

// Usage
const allChunks = await getSitemapChunks('kw-ar', 'products');
console.log(`Downloaded ${allChunks.length} sitemap chunks`);
```

**Python:**
```python
import requests

def get_sitemap_chunks(locale, sitemap_type):
    chunks = []
    chunk_id = 0
    
    while True:
        url = f"https://monsbah.com/{locale}/{sitemap_type}/sitemap-v2?id={chunk_id}"
        response = requests.get(url)
        
        if response.status_code == 404:
            # Parse the helpful error response
            error = response.json()
            print(f"Found {error['availableChunks']} chunks with {error['totalUrls']} URLs")
            break
        
        if response.status_code == 200:
            chunks.append(response.text)
            chunk_id += 1
        else:
            raise Exception(f"Unexpected status: {response.status_code}")
    
    return chunks

# Usage
all_chunks = get_sitemap_chunks('kw-ar', 'products')
print(f"Downloaded {len(all_chunks)} sitemap chunks")
```

---

## 🔍 Response Headers

All responses include helpful headers:

### Success Response (200 OK)
```
Content-Type: application/xml; charset=UTF-8
Cache-Control: s-maxage=43200, stale-while-revalidate
X-Sitemap-Chunk: 0/3              # Current chunk / total chunks
X-Sitemap-URLs: 50000             # Number of URLs in this chunk
X-Sitemap-Size: 8589934           # Size in bytes (~8.5 MB)
```

### Error Response (404 Not Found)
```
Content-Type: application/json; charset=UTF-8
X-Total-Chunks: 3                 # Total available chunks
X-Requested-Chunk: 5              # The chunk ID you requested
X-Total-URLs: 125000              # Total URLs across all chunks
```

---

## 🧪 Testing Different Scenarios

### Test 1: Valid Chunk
```bash
curl -i "http://localhost:3000/kw-ar/companies/sitemap-v2?id=0"

# Expected:
# - Status: 200 OK
# - Content-Type: application/xml
# - Body: Valid XML sitemap
```

### Test 2: Invalid Chunk (Too High)
```bash
curl -i "http://localhost:3000/kw-ar/companies/sitemap-v2?id=99"

# Expected:
# - Status: 404 Not Found
# - Content-Type: application/json
# - Body: Error details with examples
```

### Test 3: Negative Chunk (Converted to 0)
```bash
curl -i "http://localhost:3000/kw-ar/companies/sitemap-v2?id=-1"

# Note: Number("-1") becomes -1, which is < chunks.length
# So it will try to access chunks[-1] which returns undefined
# This will be handled by the error response
```

### Test 4: Non-Numeric Chunk
```bash
curl -i "http://localhost:3000/kw-ar/companies/sitemap-v2?id=abc"

# Note: Number("abc") becomes NaN
# Number.isNaN(NaN) in route handler defaults to 0
```

### Test 5: Missing ID Parameter
```bash
curl -i "http://localhost:3000/kw-ar/companies/sitemap-v2"

# Default behavior: id=0 (from searchParams.get("id") || "0")
```

---

## 📊 Comparison: Before vs After

### Before ❌
```bash
curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=1"

# Response:
Chunk not found

# Problems:
# - No context
# - Not machine-readable
# - No helpful information
# - Requires guessing
```

### After ✅
```bash
curl "http://localhost:3000/kw-ar/companies/sitemap-v2?id=1"

# Response:
{
  "error": "Chunk not found",
  "requestedChunk": 1,
  "availableChunks": 1,
  "message": "Valid chunk IDs are 0 to 0",
  "totalUrls": 45,
  "locale": "kw-ar",
  "examples": [
    "https://monsbah.com/kw-ar/companies/sitemap-v2?id=0"
  ]
}

# Benefits:
# ✅ Clear error message
# ✅ Shows valid range
# ✅ Provides example URLs
# ✅ JSON format for parsing
# ✅ Includes metadata
```

---

## 🎨 Error Response Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `error` | string | Error type | `"Chunk not found"` |
| `requestedChunk` | number | The chunk ID you requested | `1` |
| `availableChunks` | number | Total number of chunks | `1` |
| `message` | string | Human-readable explanation | `"Valid chunk IDs are 0 to 0"` |
| `totalUrls` | number | Total URLs across all chunks | `45` |
| `locale` | string | The locale of the sitemap | `"kw-ar"` |
| `examples` | array | Valid example URLs | `["https://...?id=0"]` |

---

## 💡 Pro Tips

### Tip 1: Check Available Chunks
```bash
# Quick way to find how many chunks exist
curl -s "http://localhost:3000/kw-ar/products/sitemap-v2?id=999" | jq '.availableChunks'
# Output: 3
```

### Tip 2: Get Total URL Count
```bash
# Find total URLs without downloading all chunks
curl -s "http://localhost:3000/kw-ar/products/sitemap-v2?id=999" | jq '.totalUrls'
# Output: 125000
```

### Tip 3: Validate Chunk Range
```bash
# Check if a specific chunk exists
CHUNK_ID=5
RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:3000/kw-ar/products/sitemap-v2?id=$CHUNK_ID")
STATUS="${RESPONSE: -3}"

if [ "$STATUS" == "200" ]; then
  echo "✅ Chunk $CHUNK_ID exists"
else
  echo "❌ Chunk $CHUNK_ID not found"
  echo "$RESPONSE" | jq
fi
```

---

## 🚀 Integration Examples

### Google Search Console
When submitting sitemaps to Google:
```
https://monsbah.com/kw-ar/products/sitemap-v2?id=0
https://monsbah.com/kw-ar/products/sitemap-v2?id=1
https://monsbah.com/kw-ar/products/sitemap-v2?id=2
```

### Sitemap Index
Create a sitemap index that references all chunks:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://monsbah.com/kw-ar/products/sitemap-v2?id=0</loc>
    <lastmod>2025-10-06T20:00:00Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://monsbah.com/kw-ar/products/sitemap-v2?id=1</loc>
    <lastmod>2025-10-06T20:00:00Z</lastmod>
  </sitemap>
</sitemapindex>
```

---

## 📝 Files Modified

All three sitemap-v2 routes now have enhanced error handling:

1. ✅ `/src/app/[country-locale]/companies/sitemap-v2/route.js`
2. ✅ `/src/app/[country-locale]/products/sitemap-v2/route.js`
3. ✅ `/src/app/[country-locale]/blogs/sitemap-v2/route.js`

---

## ✅ Status

| Feature | Status | Notes |
|---------|--------|-------|
| Enhanced Error Messages | ✅ Implemented | All 3 sitemap types |
| JSON Error Format | ✅ Implemented | Machine-readable |
| Helpful Examples | ✅ Implemented | Copy-paste ready URLs |
| Response Headers | ✅ Implemented | X-Total-Chunks, etc. |
| Console Logging | ✅ Implemented | Server-side debugging |
| Documentation | ✅ Complete | This file |

---

**Updated:** October 6, 2025  
**Feature:** Enhanced chunk error handling with helpful JSON responses  
**Status:** ✅ Production Ready
