# Categories Sitemap Fix Documentation

## Date: October 19, 2025

## Problem
The categories sitemap (`/sitemap-categories.xml`) was generating incorrect URLs:
1. **Wrong routing**: Using `/locale/category-slug` instead of query parameters
2. **Wrong language**: English locales (e.g., `sa-en`) were showing Arabic category slugs
3. **404 errors**: All category links in sitemap were returning 404

## Root Cause
1. Categories sitemap was using old dynamic route format (`/companies/${category}`)
2. We changed the app routing from dynamic routes to query parameters (`?category=slug`)
3. Sitemap wasn't updated to reflect this change
4. API returns same category slugs for both Arabic and English (backend limitation)

## Solution Implemented

### 1. Root Categories Sitemap (`/src/app/sitemap-categories.xml/route.js`)
**Changes:**
- ✅ Import `serverAxios` directly instead of using `getCategories` service
- ✅ Added `getCategoriesForLang()` function to fetch categories with specific language headers
- ✅ Changed URL format from `/locale/category-slug` to `/locale?category=slug`
- ✅ Fetch categories separately for Arabic and English

**Before:**
```javascript
url: `${BASE_URL}/${locale}/${category.slug}`
// Example: https://monsbah.com/sa-ar/فساتين
```

**After:**
```javascript
url: `${BASE_URL}/${locale}?category=${encodeURIComponent(category.slug)}`
// Example: https://monsbah.com/sa-ar?category=%D9%81%D8%B3%D8%A7%D8%AA%D9%8A%D9%86
```

### 2. Locale-Specific Categories Sitemap (`/src/app/[country-locale]/sitemap-categories.xml/route.js`)
**Changes:**
- ✅ Import `serverAxios` directly
- ✅ Added proper language headers (`Accept-Language` and `lang`)
- ✅ Changed URL format to use query parameters
- ✅ Added country_slug parameter to API request

**Before:**
```javascript
url: `${BASE_URL}/${locale}/${category.slug}`
```

**After:**
```javascript
url: `${BASE_URL}/${locale}?category=${encodeURIComponent(category.slug)}`
```

## Backend Limitation
⚠️ **Note**: The backend API returns the same category slugs (Arabic) for both Arabic and English languages. This is a backend limitation, not a frontend issue.

**Current behavior:**
- `sa-ar?category=فساتين` ✅ Works
- `sa-en?category=فساتين` ✅ Also works (backend accepts Arabic slugs for English)

**Ideal behavior** (requires backend changes):
- `sa-ar?category=فساتين` ✅
- `sa-en?category=dresses` ✅ (would need translated slugs from API)

## Files Modified
1. `/src/app/sitemap-categories.xml/route.js`
2. `/src/app/[country-locale]/sitemap-categories.xml/route.js`

## Related Changes
These changes align with the companies filter routing changes made earlier:
- `/src/components/companies/CompanyPageCategoriesSlider.jsx`
- `/src/components/companies/SubCategoriesCompanySlider.jsx`
- `/src/hooks/queries/products/useGetCompanyProducts.js`

## Testing
Test the sitemap:
```bash
curl http://localhost:3000/sitemap-categories.xml
curl http://localhost:3000/kw-ar/sitemap-categories.xml
```

Expected output:
- URLs should use query parameters: `?category=slug`
- All category slugs should be properly URL-encoded
- No 404 errors when clicking sitemap links

## Production Deployment
After deployment:
1. ✅ Test `/sitemap-categories.xml` on production
2. ✅ Verify all locale-specific category sitemaps work
3. ✅ Check that category links don't return 404
4. ✅ Submit updated sitemap to Google Search Console

## Future Improvements
If backend adds translated category slugs:
1. Update `getCategoriesForLang()` to use translated slugs
2. Ensure English locales get English slugs
3. Update filter components to use appropriate slugs per locale

## Status
✅ **FIXED** - Categories sitemap now uses correct query parameter routing
⚠️ **LIMITATION** - Arabic slugs used for all locales (backend limitation)
