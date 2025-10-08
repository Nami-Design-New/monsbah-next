import { getCategories } from "@/services/categories/getCategories";
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

// Fetch all categories
async function fetchAllCategories(_country_slug, _lang) {
  try {
    console.log(`[Categories Sitemap] Fetching categories...`);
    
    // getCategories returns the array directly
    const categories = await getCategories("/client/categories");

    const categoriesArray = Array.isArray(categories) ? categories : [];
    console.log(`[Categories Sitemap] Total categories fetched: ${categoriesArray.length}`);
    
    return categoriesArray;
  } catch (error) {
    console.error(`[Categories Sitemap] Error fetching categories:`, error.message);
    return [];
  }
}

// Convert categories to sitemap entries
function categoriesToSitemapEntries(categories, locale) {
  const entries = [];

  for (const category of categories) {
    if (!category?.slug) continue;

    entries.push({
      url: `${BASE_URL}/${locale}/${category.slug}`,
      lastModified: new Date(category.updated_at || category.created_at || new Date()).toISOString(),
      changeFrequency: "weekly",
      priority: 0.9, // Higher priority for categories
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

    const cacheKey = `categories-${locale}`;

    console.log(`[Categories Sitemap] Generating chunk ${chunkId} for locale ${locale}`);

    // Try to load cached data
    let cachedData = await loadSitemapCache(cacheKey);
    let chunks = [];
    let stats = null;

    if (cachedData && cachedData.chunks && cachedData.lastGenerated) {
      const cacheAge = Date.now() - new Date(cachedData.lastGenerated).getTime();
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours for categories

      if (cacheAge < MAX_CACHE_AGE) {
        console.log(`[Categories Sitemap] Using cached data`);
        chunks = cachedData.chunks;
        stats = cachedData.stats;
      } else {
        console.log(`[Categories Sitemap] Cache expired, performing incremental update`);

        // Fetch fresh categories
        const [country_slug, lang] = locale.split("-");
        const categories = await fetchAllCategories(country_slug, lang);

        const newEntries = categoriesToSitemapEntries(categories || [], locale);

        // Detect changes
        const oldEntries = cachedData.chunks.flat();
        const changes = detectSitemapChanges(oldEntries, newEntries);

        console.log(`[Categories Sitemap] Changes detected:`, {
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

        console.log(`[Categories Sitemap] Cache updated:`, stats);
      }
    } else {
      console.log(`[Categories Sitemap] No cache found, generating from scratch`);

      // Fetch all categories
      const [country_slug, lang] = locale.split("-");
      const categories = await fetchAllCategories(country_slug, lang);

      const entries = categoriesToSitemapEntries(categories || [], locale);

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

      console.log(`[Categories Sitemap] Initial cache created:`, stats);
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
          ? [`${BASE_URL}/${locale}/categories/sitemap-v2?id=0`]
          : [],
      }, null, 2);

      console.log(`[Categories Sitemap] Chunk ${chunkId} not found. Available chunks: 0-${chunks.length - 1}`);

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
        "Cache-Control": "s-maxage=86400, stale-while-revalidate", // 24 hours
        "X-Sitemap-Chunk": `${chunkId}/${chunks.length}`,
        "X-Sitemap-URLs": chunkEntries.length.toString(),
        "X-Sitemap-Size": Buffer.byteLength(xml, 'utf8').toString(),
      },
    });
  } catch (error) {
    console.error("Error generating categories sitemap chunk:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}

// Helper to get chunk count
export async function getCategoryChunkCount(locale) {
  const cacheKey = `categories-${locale}`;
  const cachedData = await loadSitemapCache(cacheKey);

  if (cachedData && cachedData.chunks) {
    return cachedData.chunks.length;
  }

  return 1;
}
