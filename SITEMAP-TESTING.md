# SEO and Sitemap Testing Guide

## Testing Your Sitemaps

### 1. Local Testing
Test all sitemaps locally before deploying:

```bash
# Start your development server
npm run dev

# Test main sitemap index
curl http://localhost:3000/sitemap.xml

# Test locale-specific sitemaps
curl http://localhost:3000/kw-ar/sitemap-static.xml
curl http://localhost:3000/kw-ar/sitemap-categories.xml
curl http://localhost:3000/kw-ar/sitemap-blogs.xml
curl http://localhost:3000/kw-ar/sitemap-companies.xml

# Test global sitemaps
curl http://localhost:3000/sitemap-images.xml
curl http://localhost:3000/sitemap-news.xml

# Test robots.txt
curl http://localhost:3000/robots.txt

# Test product sitemaps (chunked)
curl http://localhost:3000/kw-ar/products/sitemap0.xml
```

### 2. XML Validation
Use online XML validators to ensure proper formatting:
- https://www.xmlvalidation.com/
- https://validator.w3.org/feed/

### 3. Google Search Console Testing
1. Go to Google Search Console
2. Add your property (https://monsbah.com)
3. Submit your main sitemap: https://monsbah.com/sitemap.xml
4. Monitor indexing status

### 4. SEO Testing Tools
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Schema Markup Validator**: https://validator.schema.org/
- **Rich Results Test**: https://search.google.com/test/rich-results

### 5. Sitemap Performance Checklist

#### ✅ Technical Requirements
- [ ] XML format is valid
- [ ] UTF-8 encoding is used
- [ ] File sizes under 50MB uncompressed
- [ ] Maximum 50,000 URLs per sitemap
- [ ] Proper HTTP headers (Content-Type: application/xml)
- [ ] Gzip compression enabled (automatically handled by hosting)

#### ✅ SEO Best Practices
- [ ] URLs are absolute (including https://domain.com)
- [ ] Last modification dates are accurate
- [ ] Change frequencies are realistic
- [ ] Priorities are properly distributed (0.0 to 1.0)
- [ ] Only indexable content is included
- [ ] No redirect chains or broken links

#### ✅ Content Coverage
- [ ] All public pages are included
- [ ] Multi-locale support is working
- [ ] Dynamic content (products, blogs, companies) is generated
- [ ] Images are properly mapped
- [ ] News content follows Google News guidelines

### 6. Common Issues and Solutions

#### Issue: Sitemap not updating
**Solution**: Clear your deployment cache and verify dynamic generation is working

#### Issue: URLs returning 404
**Solution**: Check that your routes exist and are properly configured

#### Issue: Too many URLs in sitemap
**Solution**: Implement chunking for large datasets (already implemented for products)

#### Issue: Images not appearing in Google Images
**Solution**: Verify image URLs are accessible and follow Google's image sitemap guidelines

#### Issue: News articles not appearing in Google News
**Solution**: Ensure content is recent (last 2 days) and follows Google News publisher guidelines

### 7. Monitoring and Maintenance

#### Weekly Tasks
- Check Google Search Console for crawl errors
- Monitor sitemap submission status
- Verify new content is being indexed

#### Monthly Tasks
- Review sitemap performance metrics
- Check for broken URLs in sitemaps
- Update priorities based on page performance

#### Quarterly Tasks
- Audit entire sitemap structure
- Review and update SEO metadata
- Test sitemap generation performance

### 8. Advanced SEO Optimizations

#### Structured Data Implementation
Use the SEO utilities in `src/utils/seo.js`:

```javascript
import { generateProductStructuredData } from '@/utils/seo';

// In your product page component
const structuredData = generateProductStructuredData(product, locale);
```

#### Meta Tags Optimization
```javascript
import { generateMetaTags } from '@/utils/seo';

const metaTags = generateMetaTags({
  title: product.title,
  description: product.description,
  image: product.images[0]?.url,
  url: `${BASE_URL}/${locale}/product/${product.slug}`,
  type: 'product'
});
```

#### Hreflang Implementation
```javascript
import { generateHreflangAlternates } from '@/utils/seo';

const hreflangAlternates = generateHreflangAlternates('/about');
```

### 9. Performance Optimization

#### Caching Strategy
- Static sitemaps: 24 hours
- Dynamic sitemaps: 1-6 hours  
- News sitemap: 30 minutes
- Image sitemap: 12 hours

#### Database Optimization
- Index fields used in sitemap queries
- Optimize pagination for large datasets
- Consider caching frequently accessed data

### 10. Compliance and Guidelines

#### Google Guidelines
- Maximum 50,000 URLs per sitemap file
- Maximum 50MB uncompressed file size
- Valid XML format with proper encoding
- Absolute URLs only

#### Multi-language Best Practices
- Use hreflang annotations
- Separate sitemaps per locale when beneficial
- Consistent URL structure across locales

#### E-commerce Specific
- Include product availability in structured data
- Update product sitemaps when inventory changes
- Use appropriate priorities for different product categories

This comprehensive testing and optimization guide will help ensure your sitemap implementation provides maximum SEO benefit for the Monsbah platform.
