import { NextResponse } from 'next/server';
import { LOCALES } from '@/i18n/routing';
import { clearAllCache } from '@/utils/sitemap-utils';

/**
 * API endpoint to warm up sitemap caches
 * Usage: GET /api/warm-cache?secret=YOUR_SECRET
 * 
 * This endpoint should be called:
 * 1. After deployment
 * 2. Via cron job every 24 hours
 * 3. When you want to refresh all sitemap data
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const clearFirst = searchParams.get('clear') === 'true';
  
  // Simple authentication (replace with your own secret)
  const expectedSecret = process.env.WARM_CACHE_SECRET || 'your-secret-key';
  
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Optionally clear cache first
  if (clearFirst) {
    clearAllCache();
  }
  
  const results = {
    started: new Date().toISOString(),
    locales: LOCALES.length,
    urls: [],
    success: 0,
    failed: 0,
  };
  
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monsbah.com';
  
  // Helper to warm a URL
  const warmUrl = async (url, name) => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SitemapCacheWarmer/1.0',
        },
      });
      
      const success = response.ok;
      results.urls.push({
        url,
        name,
        status: response.status,
        success,
      });
      
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
      
      return success;
    } catch (error) {
      results.urls.push({
        url,
        name,
        error: error.message,
        success: false,
      });
      results.failed++;
      return false;
    }
  };
  
  // Warm root sitemaps
  await warmUrl(`${BASE_URL}/sitemap.xml`, 'Root sitemap index');
  await warmUrl(`${BASE_URL}/sitemap-images.xml`, 'Global images');
  
  // Warm each locale
  for (const locale of LOCALES) {
    // Locale index
    await warmUrl(`${BASE_URL}/${locale}/sitemap.xml`, `${locale} - Index`);
    
    // Static
    await warmUrl(`${BASE_URL}/${locale}/sitemap-static.xml`, `${locale} - Static`);
    
    // Categories
    await warmUrl(`${BASE_URL}/${locale}/sitemap-categories0.xml`, `${locale} - Categories`);
    
    // Products (first 5 chunks)
    for (let i = 0; i < 5; i++) {
      await warmUrl(`${BASE_URL}/${locale}/sitemap-products${i}.xml`, `${locale} - Products ${i}`);
    }
    
    // Companies (first 3 chunks)
    for (let i = 0; i < 3; i++) {
      await warmUrl(`${BASE_URL}/${locale}/sitemap-companies${i}.xml`, `${locale} - Companies ${i}`);
    }
    
    // Blogs
    await warmUrl(`${BASE_URL}/${locale}/sitemap-blogs.xml`, `${locale} - Blogs`);
  }
  
  results.completed = new Date().toISOString();
  results.duration = new Date(results.completed) - new Date(results.started);
  
  return NextResponse.json(results);
}
