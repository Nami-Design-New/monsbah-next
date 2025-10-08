import { getBlogs } from "@/services/blogs/getBlogs";
import { BASE_URL } from "@/utils/constants";
import {
  loadSitemapCache,
  saveSitemapCache,
  detectSitemapChanges,
  mergeChangesIntoChunks,
  generateSitemapXML,
  calculateSitemapStats,
} from "@/utils/sitemap-manager";

export const dynamic = "force-dynamic";

// Convert blogs to sitemap entries
function blogsToSitemapEntries(blogs, locale) {
  const entries = [];

  for (const blog of blogs) {
    if (!blog?.slug && !blog?.id) continue;

    const blogIdentifier = blog.slug || blog.id;
    const blogUrl = blog.canonical_url || `${BASE_URL}/${locale}/blogs/${blogIdentifier}`;

    entries.push({
      url: blogUrl,
      lastModified: new Date(blog.updated_at || blog.created_at || blog.date || new Date()).toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}

export async function GET(request, context) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const chunkId = Number(searchParams.get("id") || "0");
    const locale = params["country-locale"] || "kw-ar";

    const cacheKey = `blogs-${locale}`;

    console.log(`[Blogs Sitemap] Generating chunk ${chunkId} for locale ${locale}`);

    // Try to load cached data
    let cachedData = await loadSitemapCache(cacheKey);
    let chunks = [];
    let stats = null;

    if (cachedData && cachedData.chunks && cachedData.lastGenerated) {
      const cacheAge = Date.now() - new Date(cachedData.lastGenerated).getTime();
      const MAX_CACHE_AGE = 12 * 60 * 60 * 1000; // 12 hours for blogs

      if (cacheAge < MAX_CACHE_AGE) {
        console.log(`[Blogs Sitemap] Using cached data`);
        chunks = cachedData.chunks;
        stats = cachedData.stats;
      } else {
        console.log(`[Blogs Sitemap] Cache expired, performing incremental update`);

        // Fetch fresh blogs
        const [country_slug, lang] = locale.split("-");
        const blogs = await getBlogs({
          lang,
          country_slug,
          per_page: 10000,
        });

        const newEntries = blogsToSitemapEntries(blogs || [], locale);

        // Detect changes
        const oldEntries = cachedData.chunks.flat();
        const changes = detectSitemapChanges(oldEntries, newEntries);

        console.log(`[Blogs Sitemap] Changes detected:`, {
          added: changes.added.length,
          updated: changes.updated.length,
          deleted: changes.deleted.length,
        });

        // Merge changes
        chunks = mergeChangesIntoChunks(cachedData.chunks, changes);
        stats = calculateSitemapStats(chunks);

        // Save updated cache
        await saveSitemapCache(cacheKey, {
          chunks,
          stats,
          lastGenerated: new Date().toISOString(),
          locale,
        });

        console.log(`[Blogs Sitemap] Cache updated:`, stats);
      }
    } else {
      console.log(`[Blogs Sitemap] No cache found, generating from scratch`);

      // Fetch all blogs
      const [country_slug, lang] = locale.split("-");
      const blogs = await getBlogs({
        lang,
        country_slug,
        per_page: 10000,
      });

      const entries = blogsToSitemapEntries(blogs || [], locale);

      // Chunk entries
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

      console.log(`[Blogs Sitemap] Initial cache created:`, stats);
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
          ? [`${BASE_URL}/${locale}/blogs/sitemap-v2?id=0`]
          : [],
      }, null, 2);

      console.log(`[Blogs Sitemap] Chunk ${chunkId} not found. Available chunks: 0-${chunks.length - 1}`);

      return new Response(errorMessage, {
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

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=43200, stale-while-revalidate", // 12 hours
        "X-Sitemap-Chunk": `${chunkId}/${chunks.length}`,
        "X-Sitemap-URLs": chunkEntries.length.toString(),
        "X-Sitemap-Size": Buffer.byteLength(xml, 'utf8').toString(),
      },
    });
  } catch (error) {
    console.error("Error generating blogs sitemap chunk:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}

// Helper to get chunk count
export async function getBlogChunkCount(locale) {
  const cacheKey = `blogs-${locale}`;
  const cachedData = await loadSitemapCache(cacheKey);

  if (cachedData && cachedData.chunks) {
    return cachedData.chunks.length;
  }

  return 1; // Most sites will have only one chunk for blogs
}
