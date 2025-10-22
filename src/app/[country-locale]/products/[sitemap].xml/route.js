import { BASE_URL } from "@/utils/constants";
import getProducts from "@/services/products/getProducts";
import {
  generateCachedChunkedImageSitemap,
  getCachedData,
  setCachedData,
  createSitemapResponse,
} from "@/utils/sitemap-utils";

export const dynamic = "force-dynamic";

/**
 * Products sitemap route: /[locale]/products/[sitemap].xml
 * Handles: /sa-ar/products/sitemap0.xml, /kw-ar/products/sitemap1.xml, etc.
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const locale = resolvedParams["country-locale"];
    let sitemapFile = resolvedParams["sitemap"]; // e.g., "sitemap0.xml" or "sitemap0"
    
    console.log(`[Products Sitemap] RAW params:`, JSON.stringify(resolvedParams));
    console.log(`[Products Sitemap] Locale: ${locale}, Raw File: "${sitemapFile}"`);
    
    // Remove .xml extension if present
    sitemapFile = sitemapFile.replace(/\.xml$/, '');
    
    console.log(`[Products Sitemap] After cleanup: "${sitemapFile}"`);
    
    // Extract index from filename (sitemap0 -> 0, sitemap5 -> 5)
    const match = sitemapFile.match(/^sitemap(\d+)$/);
    if (!match) {
      console.log(`[Products Sitemap] Invalid format: "${sitemapFile}", no match for pattern`);
      return new Response(`Invalid sitemap filename: ${sitemapFile}`, { status: 400 });
    }
    
    const chunkIndex = parseInt(match[1], 10);
    const [country_slug, lang] = locale.split("-");
    
    console.log(`[Products Sitemap] Generating chunk ${chunkIndex} for ${locale}`);
    
    // Cache key for this locale's products
    const cacheKey = `sitemap-products-${locale}`;
    
    // Check cache first
    let allUrls = getCachedData(cacheKey);
    
    if (!allUrls) {
      console.log(`[Products Sitemap] Cache MISS - Fetching products for ${locale}...`);
      
      const products = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 100) {
        const response = await getProducts({
          pageParam: page,
          lang,
          country_slug,
          user: "client",
        });
        
        const pageProducts = response?.data?.data || response?.data || [];
        products.push(...pageProducts);
        
        hasMore = Boolean(response?.data?.links?.next || response?.links?.next);
        page++;
        
        console.log(`[Products Sitemap] Fetched page ${page-1}, total products: ${products.length}`);
      }
      
      // Transform to URLs with images
      allUrls = products.map((product) => {
        const productUrl = `${BASE_URL}/${locale}/product/${encodeURIComponent(product.slug || product.id)}${product.id ? `-id=${product.id}` : ''}`;
        
        // Extract images from product
        const images = [];
        
        // Main image
        if (product.image) {
          images.push({
            url: product.image,
            title: product.name || product.title || '',
            caption: product.description || product.name || '',
            geoLocation: country_slug.toUpperCase(),
          });
        }
        
        // Additional images from gallery
        if (product.images && Array.isArray(product.images)) {
          product.images.forEach((img, index) => {
            images.push({
              url: typeof img === 'string' ? img : img.url || img.image,
              title: product.name || product.title || '',
              caption: `${product.name || ''} - Image ${index + 2}`,
              geoLocation: country_slug.toUpperCase(),
            });
          });
        }
        
        return {
          url: productUrl,
          lastModified: new Date(product.updated_at || product.created_at || Date.now()).toISOString(),
          changeFrequency: "daily",
          priority: 0.9,
          images: images.length > 0 ? images : undefined,
        };
      });
      
      setCachedData(cacheKey, allUrls);
      console.log(`[Products Sitemap] Cached ${allUrls.length} products for ${locale}`);
    } else {
      console.log(`[Products Sitemap] Cache HIT - Using cached data (${allUrls.length} products)`);
    }
    
    // Generate XML for this specific chunk using image sitemap
    const xml = await generateCachedChunkedImageSitemap({
      cacheKey,
      fetchDataFn: async () => [],
      transformToUrlsFn: () => allUrls,
      chunkIndex,
    });

    return createSitemapResponse(xml);
  } catch (error) {
    console.error("[Products Sitemap] Error:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
