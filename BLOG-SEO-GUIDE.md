# Blog SEO Implementation Guide

## Overview
This guide shows how to implement the enhanced SEO utilities with custom canonical URL support for blog posts.

## Blog Data Structure
Your blog objects should have these fields:
```javascript
{
  id: 1,
  title: "لوريم ايبسوم",
  slug: "لوريم-ايبسوم", 
  description: "<p>Lorem ipsum dolor</p>",
  image: "https://monsbah-s3-shared-bucket.s3.me-south-1.amazonaws.com/uploads/blogs/100017100895101386.jpg",
  date: "10-03-2024",
  meta_title: "<p>Lorem ipsum dolor</p>", // Custom meta title
  meta_description: "<p>Lorem ipsum dolor</p>", // Custom meta description
  canonical_url: null, // Custom canonical URL (null = use generated URL)
  is_index: 1, // 1 = index, 0 = noindex
  is_follow: 1, // 1 = follow, 0 = nofollow
  created_at: "2024-03-10T00:00:00Z",
  updated_at: "2024-03-10T00:00:00Z"
}
```

## Updated Blog Detail Page Example

```jsx
// src/app/[country-locale]/blogs/[slug]/page.jsx
import { generateBlogSEO } from "@/utils/seo";
import { getLocale } from "next-intl/server";
import { getBlogsDetails } from "@/services/blogs/getBlogsDetails";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const locale = await getLocale();
  
  const blog = await getBlogsDetails(slug);
  
  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  // Generate all SEO data with canonical URL support
  const seoData = generateBlogSEO(blog, locale);

  return {
    title: seoData.metaTags.title,
    description: seoData.metaTags.description,
    keywords: seoData.metaTags.keywords,
    
    // Canonical URL - uses blog.canonical_url if provided, otherwise generates one
    alternates: {
      canonical: seoData.canonicalUrl,
      ...seoData.hreflangAlternates,
    },

    openGraph: seoData.openGraph,
    twitter: seoData.twitterCard,

    // Respect blog's index/follow settings
    robots: {
      index: seoData.robots.index,
      follow: seoData.robots.follow,
    },

    // Add structured data for rich snippets
    other: {
      'application/ld+json': JSON.stringify(seoData.structuredData),
    },
  };
}
```

## Canonical URL Logic

The system now works as follows:

### 1. When `canonical_url` is `null` or empty:
```javascript
const blog = {
  id: 1,
  slug: "لوريم-ايبسوم",
  canonical_url: null // or "" or undefined
};

// Generated canonical URL:
// https://monsbah.com/kw-ar/blogs/لوريم-ايبسوم
```

### 2. When `canonical_url` has a value:
```javascript
const blog = {
  id: 1,
  slug: "لوريم-ايبسوم", 
  canonical_url: "https://example.com/custom-blog-url"
};

// Uses the custom canonical URL:
// https://example.com/custom-blog-url
```

## Using Individual SEO Functions

### Generate Canonical URL
```javascript
import { generateCanonicalUrl } from "@/utils/seo";

// With custom canonical URL
const canonicalUrl = generateCanonicalUrl(
  "/blogs/my-blog", 
  "kw-ar", 
  blog.canonical_url
);

// Without custom canonical URL (blog.canonical_url is null)
const canonicalUrl = generateCanonicalUrl("/blogs/my-blog", "kw-ar", null);
// Result: https://monsbah.com/kw-ar/blogs/my-blog
```

### Generate Complete Blog SEO
```javascript
import { generateBlogSEO } from "@/utils/seo";

const blog = {
  id: 1,
  title: "لوريم ايبسوم",
  slug: "لوريم-ايبسوم",
  meta_title: "Custom Meta Title",
  meta_description: "Custom Meta Description", 
  canonical_url: null,
  is_index: 1,
  is_follow: 1,
  image: "https://example.com/image.jpg"
};

const seoData = generateBlogSEO(blog, "kw-ar");

// Returns:
{
  canonicalUrl: "https://monsbah.com/kw-ar/blogs/لوريم-ايبسوم",
  hreflangAlternates: { canonical: "...", languages: {...} },
  structuredData: { "@context": "https://schema.org", ... },
  metaTags: { title: "...", description: "...", ... },
  openGraph: { title: "...", description: "...", ... },
  twitterCard: { card: "summary_large_image", ... },
  robots: { index: true, follow: true }
}
```

## Meta Tag Fields Priority

The system uses this priority order for meta fields:

### Title
1. `blog.meta_title` (if provided)
2. `blog.title` (fallback)
3. `SEO_CONFIG.defaultTitle` (final fallback)

### Description  
1. `blog.meta_description` (if provided)
2. `blog.description` (fallback)
3. `SEO_CONFIG.defaultDescription` (final fallback)

### Robots Meta
- **Index**: `blog.is_index === 1` ? "index" : "noindex"
- **Follow**: `blog.is_follow === 1` ? "follow" : "nofollow"

## Sitemap Integration

The blog sitemaps will automatically include the canonical URLs:

```javascript
// In sitemap-blogs.xml/route.js
sitemapEntries.push({
  url: blog.canonical_url || `${BASE_URL}/${locale}/blogs/${blog.slug}`,
  lastModified: new Date(blog.updated_at || blog.created_at),
  changeFrequency: "monthly",
  priority: 0.7,
});
```

## Testing Your Implementation

### 1. Test Canonical URLs
```bash
# Check generated canonical URL (when canonical_url is null)
curl -I http://localhost:3000/kw-ar/blogs/your-blog-slug

# Should include:
# <link rel="canonical" href="https://monsbah.com/kw-ar/blogs/your-blog-slug" />

# Check custom canonical URL (when canonical_url has value)
# Should include the custom URL in canonical tag
```

### 2. Test Meta Tags
```bash
# View source and check for:
<title>Your Meta Title</title>
<meta name="description" content="Your Meta Description" />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="your-canonical-url" />
```

### 3. Test Structured Data
Use Google's Rich Results Test: https://search.google.com/test/rich-results

### 4. Test Social Media
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

## Best Practices

### 1. Custom Canonical URLs
- Use custom canonical URLs for syndicated content
- Always use absolute URLs (https://domain.com/path)
- Avoid redirect chains in canonical URLs

### 2. Meta Fields
- Keep meta titles under 60 characters
- Keep meta descriptions under 160 characters
- Use descriptive, unique titles and descriptions

### 3. Index/Follow Settings
- Set `is_index: 0` for duplicate or low-quality content
- Set `is_follow: 0` for untrusted external links

### 4. Images
- Always provide high-quality images for social sharing
- Use 1200x630 pixels for optimal Open Graph display
- Include descriptive alt text

This implementation provides full control over blog SEO while maintaining backward compatibility and following SEO best practices.
