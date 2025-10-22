import { BASE_URL } from "@/utils/constants";
import getProductsForSitemap from "@/services/products/getProductsForSitemap";
import {
  generateCachedChunkedImageSitemap,
  getCachedData,
  setCachedData,
} from "@/utils/sitemap-utils";

export const dynamic = "force-dynamic";

/**
 * Products sitemap with images
 * Route: /kw-ar/products/sitemap0.xml, /kw-ar/products/sitemap1.xml, etc.
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const locale = resolvedParams["country-locale"];
    const index = resolvedParams["index"];
    
    const chunkIndex = parseInt(index, 10);
    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return new Response('Invalid index', { status: 400 });
    }
    
    const [country_slug, lang] = locale.split("-");
    
    console.log(`[Products Sitemap] Chunk ${chunkIndex} for ${locale}`);
    
    const cacheKey = `sitemap-products-${locale}`;
    
    // Check cache first
    let allUrls = getCachedData(cacheKey);
    
    if (!allUrls) {
      console.log(`[Products] Fetching all products for ${locale}...`);
      
      const products = [];
      let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 200) {
      const response = await getProductsForSitemap({
        page,
        lang,
        country_slug,
      });
      
      const pageProducts = response?.items || [];
      products.push(...pageProducts);
      
      hasMore = Boolean(response?.links?.next);
      page++;
      }
      
      // Transform to URLs with images
      allUrls = products.map((product) => {
        const encodedSlug = encodeURIComponent(product.slug || product.id);
        const productUrl = `${BASE_URL}/${locale}/product/${encodedSlug}${product.id ? `-id=${product.id}` : ''}`;
        
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
      console.log(`[Products] Cached ${allUrls.length} products for ${locale}`);
    }
    
    // Generate XML for this specific chunk using image sitemap
    const xml = await generateCachedChunkedImageSitemap({
      cacheKey,
      fetchDataFn: async () => [],
      transformToUrlsFn: () => allUrls,
      chunkIndex,
    });

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating products sitemap:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
