import { getCategories } from "@/services/categories/getCategories";
import { BASE_URL } from "@/utils/constants";

// Google limits
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const dynamic = "force-dynamic";

// Helper: Estimate XML size
function estimateEntrySize(url, lastmod) {
  const entry = `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  return new Blob([entry]).size;
}

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    
    // Extract chunk ID
    const chunkParam = resolvedParams.categories || "categories0.xml";
    const chunkId = parseInt(chunkParam.replace('categories', '').replace('.xml', '')) || 0;
    
    const locale = resolvedParams["country-locale"] || "kw-ar";
    const [country_slug, lang] = locale.split("-");
    
    // Fetch categories
    const endpoint = `/client/categories?country_slug=${country_slug}&lang=${lang}`;
    const allCategories = await getCategories(endpoint);
    const categoriesArray = Array.isArray(allCategories) ? allCategories : [];
    
    // Smart chunking
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const xmlFooter = `</urlset>`;
    const headerFooterSize = new Blob([xmlHeader + xmlFooter]).size;
    
    for (const category of categoriesArray) {
      if (!category?.slug) continue;
      
      const url = `${BASE_URL}/${locale}/${category.slug}`;
      const lastmod = new Date(category.updated_at || category.created_at || new Date()).toISOString();
      const entrySize = estimateEntrySize(url, lastmod);
      
      if (
        currentChunk.length >= MAX_URLS_PER_SITEMAP ||
        (currentSize + entrySize + headerFooterSize) >= MAX_FILE_SIZE_BYTES
      ) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [];
          currentSize = 0;
        }
      }
      
      currentChunk.push({ url, lastmod });
      currentSize += entrySize;
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    if (chunkId >= chunks.length) {
      return new Response("Sitemap chunk not found", { status: 404 });
    }
    
    const chunkData = chunks[chunkId];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunkData
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    const xmlSize = new Blob([xml]).size;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "X-Categories-Count": chunkData.length.toString(),
        "X-Total-Categories": categoriesArray.length.toString(),
        "X-Total-Chunks": chunks.length.toString(),
        "X-Current-Chunk": chunkId.toString(),
        "X-File-Size": `${(xmlSize / 1024).toFixed(2)}KB`,
        "X-Generation-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("Error generating categories sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
