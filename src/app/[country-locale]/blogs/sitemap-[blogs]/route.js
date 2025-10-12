import { getBlogs } from "@/services/blogs/getBlogs";
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
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  return new Blob([entry]).size;
}

// Function to get all blogs with pagination
async function getAllBlogsForSitemap(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    
    const allBlogs = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 100) {
      try {
        const response = await getBlogs({
          lang,
          country_slug,
          page,
          per_page: 100,
        });
        
        const blogs = Array.isArray(response) ? response : (response?.data || []);
        
        if (blogs.length > 0) {
          allBlogs.push(...blogs);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching blogs page ${page}:`, error);
        hasMore = false;
      }
    }
    
    return allBlogs;
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
    return [];
  }
}

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    
    // Extract chunk ID
    const chunkParam = resolvedParams.blogs || "blogs0.xml";
    const chunkId = parseInt(chunkParam.replace('blogs', '').replace('.xml', '')) || 0;
    
    const locale = resolvedParams["country-locale"] || "kw-ar";
    
    // Get all blogs
    const allBlogs = await getAllBlogsForSitemap(locale);
    
    // Smart chunking
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const xmlFooter = `</urlset>`;
    const headerFooterSize = new Blob([xmlHeader + xmlFooter]).size;
    
    for (const blog of allBlogs) {
      if (!blog?.slug && !blog?.id) continue;
      
      const blogIdentifier = blog.slug || blog.id;
      const url = `${BASE_URL}/${locale}/blogs/${blogIdentifier}`;
      const lastmod = new Date(blog.updated_at || blog.created_at || new Date()).toISOString();
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
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
        "X-Blogs-Count": chunkData.length.toString(),
        "X-Total-Blogs": allBlogs.length.toString(),
        "X-Total-Chunks": chunks.length.toString(),
        "X-Current-Chunk": chunkId.toString(),
        "X-File-Size": `${(xmlSize / 1024).toFixed(2)}KB`,
        "X-Generation-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("Error generating blogs sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
