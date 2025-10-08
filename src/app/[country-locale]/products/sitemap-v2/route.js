import { NextResponse } from "next/server";
import getProducts from "@/services/products/getProducts";
import { BASE_URL } from "@/utils/constants";
import {
  loadSitemapCache,
  saveSitemapCache,
  detectSitemapChanges,
  mergeChangesIntoChunks,
  generateSitemapXML,
  calculateSitemapStats,
  SitemapLimits,
} from "@/utils/sitemap-manager";

export const dynamic = "force-dynamic";

// Fetch all products for the locale
async function fetchAllProducts(locale) {
  const [country_slug, lang] = locale.split("-");
  const allProducts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const data = await getProducts({
        pageParam: page,
        lang,
        country_slug,
        user: "client",
        per_page: 100, // Fetch more per page for efficiency
      });

      const products = data?.data?.data || [];
      if (products.length === 0) break;

      allProducts.push(...products);

      // Check if there's a next page
      hasMore = Boolean(data?.data?.links?.next);
      page++;

      // Safety limit to prevent infinite loops
      if (page > 1000) break;
    } catch (error) {
      console.error(`Error fetching products page ${page}:`, error);
      break;
    }
  }

  return allProducts;
}

// Convert products to sitemap entries
function productsToSitemapEntries(products, locale) {
  const entries = [];

  for (const product of products) {
    if (!product?.slug || !product?.id) continue;

    // Determine last modification date
    let lastmodSource = product?.updated_at;
    if (!lastmodSource && Array.isArray(product?.images) && product.images.length) {
      lastmodSource = product.images.reduce((latest, img) => {
        if (img?.updated_at && (!latest || new Date(img.updated_at) > new Date(latest))) {
          return img.updated_at;
        }
        return latest;
      }, null);
    }
    if (!lastmodSource) lastmodSource = product?.created_at;

    const lastmod = new Date(lastmodSource || new Date()).toISOString();
    const productUrl = `${BASE_URL}/${locale}/product/${product.slug}-id=${product.id}`;

    // Add main product URL
    entries.push({
      url: productUrl,
      lastModified: lastmod,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // Add company product URL if applicable
    if (product?.user?.user_type === "company" && product?.company_name) {
      entries.push({
        url: `${BASE_URL}/${locale}/company-product/${product.slug}-id=${product.id}`,
        lastModified: lastmod,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}

export async function GET(request, context) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const chunkId = Number(searchParams.get("id") || "0");
    const locale = params["country-locale"] || "sa-ar";

    const cacheKey = `products-${locale}`;

    console.log(`[Products Sitemap] Generating chunk ${chunkId} for locale ${locale}`);

    // Try to load cached data
    let cachedData = await loadSitemapCache(cacheKey);
    let chunks = [];
    let stats = null;

    if (cachedData && cachedData.chunks && cachedData.lastGenerated) {
      const cacheAge = Date.now() - new Date(cachedData.lastGenerated).getTime();
      const MAX_CACHE_AGE = 6 * 60 * 60 * 1000; // 6 hours

      // Use cache if it's fresh enough
      if (cacheAge < MAX_CACHE_AGE) {
        console.log(`[Products Sitemap] Using cached data (age: ${Math.round(cacheAge / 1000 / 60)} minutes)`);
        chunks = cachedData.chunks;
        stats = cachedData.stats;
      } else {
        console.log(`[Products Sitemap] Cache expired, performing incremental update`);
        
        // Fetch fresh products
        const products = await fetchAllProducts(locale);
        const newEntries = productsToSitemapEntries(products, locale);
        
        // Detect changes
        const oldEntries = cachedData.chunks.flat();
        const changes = detectSitemapChanges(oldEntries, newEntries);
        
        console.log(`[Products Sitemap] Changes detected:`, {
          added: changes.added.length,
          updated: changes.updated.length,
          deleted: changes.deleted.length,
          unchanged: changes.unchanged.length,
        });
        
        // Merge changes efficiently
        chunks = mergeChangesIntoChunks(cachedData.chunks, changes);
        stats = calculateSitemapStats(chunks);
        
        // Save updated cache
        await saveSitemapCache(cacheKey, {
          chunks,
          stats,
          lastGenerated: new Date().toISOString(),
          locale,
        });
        
        console.log(`[Products Sitemap] Cache updated:`, stats);
      }
    } else {
      console.log(`[Products Sitemap] No cache found, generating from scratch`);
      
      // Fetch all products
      const products = await fetchAllProducts(locale);
      const entries = productsToSitemapEntries(products, locale);
      
      // Import chunking function
      const { chunkSitemapEntries } = await import("@/utils/sitemap-manager");
      chunks = chunkSitemapEntries(entries);
      stats = calculateSitemapStats(chunks);
      
      // Save to cache
      await saveSitemapCache(cacheKey, {
        chunks,
        stats,
        lastGenerated: new Date().toISOString(),
        locale,
      });
      
      console.log(`[Products Sitemap] Initial cache created:`, stats);
    }

    // Return requested chunk
    if (chunkId >= chunks.length) {
      // Provide helpful error message with available chunks info
      const errorMessage = JSON.stringify({
        error: "Chunk not found",
        requestedChunk: chunkId,
        availableChunks: chunks.length,
        message: `Valid chunk IDs are 0 to ${chunks.length - 1}`,
        totalUrls: stats?.totalUrls || 0,
        locale,
        examples: chunks.length > 0 
          ? [`${BASE_URL}/${locale}/products/sitemap-v2?id=0`]
          : [],
      }, null, 2);

      console.log(`[Products Sitemap] Chunk ${chunkId} not found. Available chunks: 0-${chunks.length - 1}`);

      return new NextResponse(errorMessage, {
        status: 404,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "X-Total-Chunks": chunks.length.toString(),
          "X-Requested-Chunk": chunkId.toString(),
          "X-Total-URLs": (stats?.totalUrls || 0).toString(),
        },
      });
    }

    const chunkEntries = chunks[chunkId];
    const xml = generateSitemapXML(chunkEntries);

    // Calculate actual size
    const actualSize = Buffer.byteLength(xml, 'utf8');
    const isWithinLimits = actualSize <= SitemapLimits.MAX_BYTES_PER_SITEMAP && 
                          chunkEntries.length <= SitemapLimits.MAX_URLS_PER_SITEMAP;

    console.log(`[Products Sitemap] Chunk ${chunkId} stats:`, {
      urls: chunkEntries.length,
      sizeMB: (actualSize / (1024 * 1024)).toFixed(2),
      withinLimits: isWithinLimits,
    });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=21600, stale-while-revalidate", // 6 hours
        "X-Sitemap-Chunk": `${chunkId}/${chunks.length}`,
        "X-Sitemap-URLs": chunkEntries.length.toString(),
        "X-Sitemap-Size": actualSize.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating products sitemap chunk:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}

// Helper function to get total chunk count (used by main sitemap index)
export async function getProductChunkCount(locale) {
  const cacheKey = `products-${locale}`;
  const cachedData = await loadSitemapCache(cacheKey);
  
  if (cachedData && cachedData.chunks) {
    return cachedData.chunks.length;
  }
  
  // Estimate if no cache exists (will be accurate after first generation)
  return 10;
}
