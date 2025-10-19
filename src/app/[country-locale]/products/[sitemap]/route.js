import getProducts from "@/services/products/getProducts";
import { BASE_URL } from "@/utils/constants";

// Optimized configuration
const MAX_URLS_PER_SITEMAP = 500; // Increased back to 500 for better coverage
const PRODUCTS_PER_PAGE = 50; // API returns 50 per page
const MAX_PAGES_TO_FETCH = 10; // Fetch 10 pages = 500 products max

// Use ISR (Incremental Static Regeneration) for better performance
export const dynamic = "force-static";
export const revalidate = 3600; // Regenerate every hour
export const fetchCache = "force-cache";
export const maxDuration = 60; // Allow up to 60 seconds for generation

// Pre-generate first 5 sitemaps for each locale at build time
export async function generateStaticParams() {
  const locales = [
    "sa-ar", "sa-en",
    "kw-ar", "kw-en",
    "ae-ar", "ae-en",
    "bh-ar", "bh-en",
    "om-ar", "om-en",
    "qa-ar", "qa-en"
  ];
  
  const params = [];
  
  // Generate first 5 sitemaps for each locale
  locales.forEach(locale => {
    for (let i = 0; i < 5; i++) {
      params.push({
        "country-locale": locale,
        sitemap: `sitemap${i}.xml`
      });
    }
  });
  
  return params;
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

    // Calculate which pages to fetch for this sitemap chunk
    // sitemap0 = pages 1-10, sitemap1 = pages 11-20, etc.
    const startPage = (id * 10) + 1;
    const endPage = startPage + 9; // 10 pages per sitemap

    console.log(`[Sitemap ${id}] Fetching pages ${startPage}-${endPage} for ${locale}`);

    // Fetch pages with proper pagination
    const products = [];
    
    for (let page = startPage; page <= endPage; page++) {
      try {
        const data = await getProducts({
          pageParam: page,
          lang,
          country_slug,
          user: "client",
        });

        const list = data?.data?.data || [];
        
        if (list.length === 0) {
          // No more data, stop fetching
          console.log(`[Sitemap ${id}] No more data at page ${page}`);
          break;
        }
        
        products.push(...list);
        
        // Stop if we have enough products
        if (products.length >= MAX_URLS_PER_SITEMAP) {
          break;
        }
      } catch (error) {
        console.error(`[Sitemap ${id}] Error fetching page ${page}:`, error.message);
        // Continue to next page on error
        continue;
      }
    }

    // Trim to max if exceeded
    if (products.length > MAX_URLS_PER_SITEMAP) {
      products.length = MAX_URLS_PER_SITEMAP;
    }

    const generationTime = Date.now() - startTime;
    console.log(`[Sitemap ${id}] Generated with ${products.length} products in ${generationTime}ms`);

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
        // ISR: Cache for 1 hour, serve stale for 24 hours while revalidating
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Products-Count": products.length.toString(),
        "X-Generation-Time": `${generationTime}ms`,
        "X-Sitemap-ID": id.toString(),
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
