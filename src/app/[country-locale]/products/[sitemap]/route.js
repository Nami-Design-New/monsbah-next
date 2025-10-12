import getProducts from "@/services/products/getProducts";
import { BASE_URL } from "@/utils/constants";

// Optimized limits for faster loading
// Google allows up to 50k, but we use 5k for better performance
const MAX_URLS_PER_SITEMAP = 5000;
const PRODUCTS_PER_API_PAGE = 50;
const PAGES_PER_CHUNK = Math.ceil(MAX_URLS_PER_SITEMAP / PRODUCTS_PER_API_PAGE); // 100 pages
const PARALLEL_REQUESTS = 5; // Fetch 5 pages at once
const REQUEST_TIMEOUT = 30000; // 30 seconds total timeout

export const dynamic = "force-dynamic";

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
    // The param will be like "sitemap0.xml" or "sitemap1.xml"
    const sitemapParam = resolvedParams.sitemap || "sitemap0.xml";
    const id = parseInt(sitemapParam.replace('sitemap', '').replace('.xml', '')) || 0;
    
    const locale = resolvedParams["country-locale"] || "sa-ar";
    const [country_slug, lang] = locale.split("-");

    // Compute the API page range for this sitemap chunk
    const startPage = id * PAGES_PER_CHUNK + 1;
    const endPage = startPage + PAGES_PER_CHUNK - 1;

    const products = [];
    let currentPage = startPage;

    // Fetch pages in parallel batches for speed
    while (currentPage <= endPage && products.length < MAX_URLS_PER_SITEMAP) {
      // Check if we're approaching timeout
      const elapsed = Date.now() - startTime;
      if (elapsed > REQUEST_TIMEOUT) {
        console.warn(`Sitemap ${id} timeout after ${elapsed}ms, returning ${products.length} products`);
        break;
      }

      // Prepare batch of parallel requests
      const batchPages = [];
      for (let i = 0; i < PARALLEL_REQUESTS && currentPage <= endPage; i++) {
        batchPages.push(currentPage);
        currentPage++;
      }

      try {
        // Fetch batch in parallel
        const batchPromises = batchPages.map(page =>
          fetchWithTimeout(
            getProducts({
              pageParam: page,
              lang,
              country_slug,
              user: "client",
            }),
            10000 // 10s per request
          ).catch(error => {
            console.error(`Error fetching page ${page}:`, error.message);
            return { data: { data: [] } };
          })
        );

        const results = await Promise.all(batchPromises);

        // Process results
        let hasData = false;
        for (const data of results) {
          const list = data?.data?.data || [];
          if (list.length > 0) {
            hasData = true;
            products.push(...list);
            
            // Stop if we've reached the limit
            if (products.length >= MAX_URLS_PER_SITEMAP) {
              products.splice(MAX_URLS_PER_SITEMAP); // Trim excess
              break;
            }
          }
        }

        // If no data in this batch, stop fetching
        if (!hasData) {
          break;
        }

      } catch (error) {
        console.error(`Error fetching batch starting at page ${batchPages[0]}:`, error.message);
        break;
      }
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
        // Cache for 24 hours, revalidate in background for 7 days
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "X-Products-Count": products.length.toString(),
        "X-Generation-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("Error generating products sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
