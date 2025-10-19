import getProducts from "@/services/products/getProducts";
import { BASE_URL } from "@/utils/constants";

// Optimized limits for faster loading and avoiding timeouts
const MAX_URLS_PER_SITEMAP = 100; // Only 100 products to avoid timeout
const REQUEST_TIMEOUT = 10000; // 10 seconds total timeout

// For development: use dynamic with aggressive caching
// For production: will use ISR with revalidation
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour
export const maxDuration = 15; // Max 15 seconds

// Helper: Fetch with timeout
async function fetchWithTimeout(promise, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    
    // Extract the sitemap ID from the dynamic route param
    const sitemapParam = resolvedParams.sitemap || "sitemap0.xml";
    const id = parseInt(sitemapParam.replace('sitemap', '').replace('.xml', '')) || 0;
    
    const locale = resolvedParams["country-locale"] || "sa-ar";
    const [country_slug, lang] = locale.split("-");

    // Simplified approach: fetch only first 2 pages with strict timeout
    const products = [];
    let consecutiveFailures = 0;
    const maxPages = 2; // Only 2 pages = 100 products max
    
    for (let page = 1; page <= maxPages && products.length < MAX_URLS_PER_SITEMAP; page++) {
      // Check timeout
      const elapsed = Date.now() - startTime;
      if (elapsed > REQUEST_TIMEOUT) {
        console.warn(`Timeout after ${elapsed}ms at page ${page}, products: ${products.length}`);
        break;
      }

      try {
        const data = await fetchWithTimeout(
          getProducts({
            pageParam: page,
            lang,
            country_slug,
            user: "client",
          }),
          2000 // Only 2s per request
        );

        const list = data?.data?.data || [];
        
        if (list.length > 0) {
          products.push(...list);
          consecutiveFailures = 0; // Reset on success
        } else {
          consecutiveFailures++;
          if (consecutiveFailures >= 3) {
            console.log(`No more data after ${page} pages`);
            break; // Stop if 3 pages in a row have no data
          }
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);
        consecutiveFailures++;
        if (consecutiveFailures >= 3) {
          console.warn(`Too many failures, stopping at page ${page}`);
          break;
        }
      }
    }

    // Trim to max if exceeded
    if (products.length > MAX_URLS_PER_SITEMAP) {
      products.splice(MAX_URLS_PER_SITEMAP);
    }

    console.log(`Sitemap ${id} generated with ${products.length} products in ${Date.now() - startTime}ms`);

    // Generate XML sitemap
    const currentDate = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
  .map((product) => {
    if (!product?.slug || !product?.id) return "";
    return `  <url>
    <loc>${BASE_URL}/${locale}/product/${product.slug}-id=${product.id}</loc>
    <lastmod>${product.updated_at || product.created_at || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  })
  .filter(Boolean)
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        // Cache for 1 hour, revalidate in background for 24 hours
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Products-Count": products.length.toString(),
        "X-Generation-Time": `${Date.now() - startTime}ms`,
        "X-Chunk-ID": id.toString(),
        "X-Total-Pages": PAGES_PER_CHUNK.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating products sitemap:", error);
    
    // Return empty sitemap instead of error to prevent 504
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error generating sitemap: ${error.message} -->
</urlset>`;
    
    return new Response(emptyXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Error": "true",
      },
    });
  }
}
