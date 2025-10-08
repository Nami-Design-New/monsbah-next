# Monsbah SEO Sitemap Documentation

## Overview
This document outlines the comprehensive sitemap structure implemented for the Monsbah e-commerce platform to improve SEO performance across all supported locales and content types.

## Sitemap Structure

### 1. Main Sitemap Index (`/sitemap.xml`)
The main sitemap index that references all other sitemaps. This is what you submit to Google Search Console.

**Features:**
- Dynamic generation based on available content
- Multi-locale support for all country-language combinations
- Automatic chunking for large datasets
- Proper XML namespace declarations

### 2. Static Pages Sitemap (`/[locale]/sitemap-static.xml`)
Contains all static pages with optimized priorities and change frequencies.

**Included Pages:**
- Homepage (Priority: 1.0, Daily updates)
- About page (Priority: 0.9, Monthly updates)
- Contact page (Priority: 0.8, Monthly updates)
- Categories listing (Priority: 0.9, Weekly updates)
- Companies listing (Priority: 0.8, Daily updates)
- Search pages (Priority: 0.7-0.8, Daily/Weekly updates)
- Profile pages (Priority: 0.4-0.6, Weekly/Monthly updates)

### 3. Categories Sitemap (`/[locale]/sitemap-categories.xml`)
Dynamic sitemap for all product categories.

**Features:**
- Locale-specific category URLs
- Priority: 0.8 (high importance for navigation)
- Change frequency: Weekly
- Last modified dates based on category updates

### 4. Blogs Sitemap (`/[locale]/sitemap-blogs.xml`)
Dynamic sitemap for all blog content.

**Features:**
- Individual blog post URLs
- Priority: 0.7 (good for content marketing SEO)
- Change frequency: Monthly
- Proper last modified dates from content management system

### 5. Companies Sitemap (`/[locale]/sitemap-companies.xml`)
Dynamic sitemap for company profile pages.

**Features:**
- Company detail page URLs
- Priority: 0.7 (important for B2B discovery)
- Change frequency: Monthly
- Last modified based on company profile updates

### 6. Products Sitemap (`/[locale]/products/sitemap[id].xml`)
Chunked dynamic sitemaps for product pages to handle large inventories.

**Features:**
- Automatic chunking (50,000 URLs per sitemap max)
- Dual product URLs (regular product page + company product page)
- Priority: 0.7 (core content)
- Change frequency: Weekly
- Image-aware last modification dates

### 7. Images Sitemap (`/sitemap-images.xml`)
Specialized sitemap for product images to improve image SEO.

**Features:**
- Google Images sitemap format
- Image captions and titles
- Geographic location data
- License information
- Duplicate removal

### 8. News Sitemap (`/sitemap-news.xml`)
Google News-specific sitemap for recent blog content.

**Features:**
- Only includes content from last 2 days
- Google News XML format
- Publication metadata
- Language-specific content
- Keywords and tags support

## SEO Optimizations Implemented

### 1. Proper Prioritization
- Homepage: 1.0 (highest priority)
- Category pages: 0.9 (important for navigation)
- Product/Company pages: 0.7-0.8 (core content)
- Blog content: 0.7 (content marketing)
- Profile/Settings: 0.4-0.6 (lower priority)

### 2. Appropriate Change Frequencies
- Homepage: Daily (frequently updated)
- Products: Weekly (regular inventory changes)
- Categories: Weekly (structure changes)
- Companies: Monthly (profile updates)
- Blogs: Monthly (content updates)
- Static pages: Yearly (rarely change)

### 3. Multi-locale Support
All sitemaps support the following locales:
- Saudi Arabia: `sa-ar`, `sa-en`
- Kuwait: `kw-ar`, `kw-en`
- UAE: `ae-ar`, `ae-en` 
- Bahrain: `bh-ar`, `bh-en`
- Oman: `om-ar`, `om-en`
- Qatar: `qa-ar`, `qa-en`

### 4. Technical Optimizations
- Dynamic sitemap generation with `force-dynamic`
- Proper XML encoding (UTF-8)
- Appropriate cache headers
- Error handling and fallbacks
- Size limits compliance (50MB/50K URLs per sitemap)

## Implementation Files

```
src/app/
├── sitemap.xml/route.js                 # Main sitemap index
├── sitemap-static.xml/route.js          # Global static pages
├── sitemap-blogs.xml/route.js           # Global blogs sitemap  
├── sitemap-companies.xml/route.js       # Global companies sitemap
├── sitemap-images.xml/route.js          # Images sitemap
├── sitemap-news.xml/route.js            # News sitemap
├── robots.txt/route.js                  # Enhanced robots.txt
└── [country-locale]/
    ├── sitemap-static.xml/route.js      # Locale-specific static pages
    ├── sitemap-categories.xml/route.js  # Locale-specific categories
    ├── sitemap-blogs.xml/route.js       # Locale-specific blogs
    ├── sitemap-companies.xml/route.js   # Locale-specific companies
    └── products/
        └── sitemap/route.js             # Chunked products sitemap
```

## Configuration Files

```
src/utils/
├── seo.js                               # SEO helpers and structured data
└── constants.js                         # BASE_URL and other constants
```

## Google Search Console Setup

1. **Submit Main Sitemap:**
   ```
   https://monsbah.com/sitemap.xml
   ```

2. **Optional Individual Sitemaps:**
   ```
   https://monsbah.com/sitemap-images.xml
   https://monsbah.com/sitemap-news.xml
   ```

3. **Monitor in Search Console:**
   - Check sitemap processing status
   - Monitor indexed vs submitted URLs
   - Review any crawling errors

## Performance Considerations

1. **Caching:** All sitemaps use appropriate cache headers
2. **Chunking:** Large datasets are automatically chunked
3. **Error Handling:** Graceful fallbacks for API failures
4. **Size Limits:** Compliance with Google's 50MB/50K URL limits

## Maintenance

1. **Regular Monitoring:** Check sitemap generation and submission status
2. **Content Updates:** Sitemaps automatically reflect new content
3. **Performance:** Monitor generation time for large datasets
4. **Error Logging:** Review server logs for sitemap generation errors

## Advanced Features

1. **Structured Data:** SEO utility functions for rich snippets
2. **Hreflang:** Multi-locale URL alternatives
3. **Open Graph:** Social media optimization
4. **Image SEO:** Dedicated image sitemap for better discovery
5. **News SEO:** Google News compliance for recent content

This comprehensive sitemap implementation should significantly improve the SEO performance of the Monsbah platform across all supported markets and content types.
