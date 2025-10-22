/**
 * Sitemap Cache Warming Script
 * Pre-loads all sitemaps to populate the cache
 */

const LOCALES = [
  'sa-ar', 'sa-en',
  'kw-ar', 'kw-en',
  'ae-ar', 'ae-en',
  'bh-ar', 'bh-en',
  'om-ar', 'om-en',
  'qa-ar', 'qa-en'
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 120000; // 2 minutes per request

async function fetchWithTimeout(url, timeout = TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SitemapCacheWarmer/1.0'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function warmUrl(url, name) {
  process.stdout.write(`  ⏳ ${name}... `);
  
  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout(url);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (response.ok) {
      console.log(`✅ (${response.status}) - ${duration}s`);
      return true;
    } else {
      console.log(`❌ (${response.status})`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`⏱️  TIMEOUT`);
    } else {
      console.log(`❌ ${error.message}`);
    }
    return false;
  }
}

async function warmCache() {
  console.log('🔥 Warming up sitemap caches...');
  console.log('================================');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('');
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  // 1. Root sitemap
  console.log('1️⃣  Root Sitemaps');
  if (await warmUrl(`${BASE_URL}/sitemap.xml`, 'Root sitemap index')) {
    totalSuccess++;
  } else {
    totalFailed++;
  }
  
  if (await warmUrl(`${BASE_URL}/sitemap-images.xml`, 'Global images sitemap')) {
    totalSuccess++;
  } else {
    totalFailed++;
  }
  console.log('');
  
  // 2. Each locale
  for (const locale of LOCALES) {
    console.log(`3️⃣  Locale: ${locale}`);
    
    // Locale index
    if (await warmUrl(`${BASE_URL}/${locale}/sitemap.xml`, 'Sitemap index')) {
      totalSuccess++;
    } else {
      totalFailed++;
    }
    
    // Static
    if (await warmUrl(`${BASE_URL}/${locale}/sitemap-static.xml`, 'Static pages')) {
      totalSuccess++;
    } else {
      totalFailed++;
    }
    
    // Categories
    if (await warmUrl(`${BASE_URL}/${locale}/sitemap-categories0.xml`, 'Categories')) {
      totalSuccess++;
    } else {
      totalFailed++;
    }
    
    // Products (5 chunks to start)
    console.log('  🛍️  Products chunks (this may take a while)...');
    for (let i = 0; i < 5; i++) {
      if (await warmUrl(`${BASE_URL}/${locale}/sitemap-products${i}.xml`, `Products chunk ${i}`)) {
        totalSuccess++;
      } else {
        totalFailed++;
      }
    }
    
    // Companies (3 chunks to start)
    console.log('  🏢 Companies chunks...');
    for (let i = 0; i < 3; i++) {
      if (await warmUrl(`${BASE_URL}/${locale}/sitemap-companies${i}.xml`, `Companies chunk ${i}`)) {
        totalSuccess++;
      } else {
        totalFailed++;
      }
    }
    
    // Blogs
    if (await warmUrl(`${BASE_URL}/${locale}/sitemap-blogs.xml`, 'Blogs')) {
      totalSuccess++;
    } else {
      totalFailed++;
    }
    
    console.log('');
  }
  
  console.log('================================');
  console.log(`✅ Cache warming complete!`);
  console.log(`📊 Success: ${totalSuccess} | Failed: ${totalFailed}`);
  console.log('');
  console.log('💡 Cache settings:');
  console.log('   - Duration: 300 seconds (5 minutes) for development');
  console.log('   - Update CACHE_DURATION to 86400 (24 hours) for production');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Test a sitemap URL - it should load instantly now');
  console.log('   2. For production, run this script via cron every 24 hours');
  console.log('   3. Or call the warm-cache API endpoint after deployments');
}

// Run the warming
warmCache().catch(console.error);
