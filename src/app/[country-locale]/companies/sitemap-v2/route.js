import getCompanies from "@/services/companies/getCompanies";
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

// Fetch all companies with pagination
async function fetchAllCompanies(country_slug, _lang) {
  let allCompanies = [];
  let currentPage = 1;
  let hasMorePages = true;

  try {
    while (hasMorePages) {
      console.log(`[Companies Sitemap] Fetching page ${currentPage}...`);
      
      const response = await getCompanies({
        pageParam: currentPage,
        country_slug,
      });

      if (!response || !response.data) {
        console.log(`[Companies Sitemap] No data in response for page ${currentPage}`);
        break;
      }

      // API returns: { data: { data: [...companies], meta: {...}, links: {...} } }
      const companies = response.data?.data || [];
      const meta = response.data?.meta || {};
      
      if (companies && companies.length > 0) {
        allCompanies = allCompanies.concat(companies);
        console.log(`[Companies Sitemap] Fetched ${companies.length} companies from page ${currentPage}. Total: ${allCompanies.length}`);
        
        // Check if there are more pages
        const totalPages = meta.last_page || 1;
        hasMorePages = currentPage < totalPages;
        currentPage++;
      } else {
        console.log(`[Companies Sitemap] No more companies on page ${currentPage}`);
        hasMorePages = false;
      }
    }

    console.log(`[Companies Sitemap] Total companies fetched: ${allCompanies.length}`);
    return allCompanies;
  } catch (error) {
    console.error(`[Companies Sitemap] Error fetching companies:`, error.message);
    console.error(`[Companies Sitemap] Error stack:`, error.stack);
    return allCompanies; // Return what we have so far
  }
}

// Convert companies to sitemap entries
function companiesToSitemapEntries(companies, locale) {
  const entries = [];

  for (const company of companies) {
    if (!company?.slug && !company?.id) continue;

    const companyIdentifier = company.slug || company.id;

    entries.push({
      url: `${BASE_URL}/${locale}/company-details/${companyIdentifier}`,
      lastModified: new Date(company.updated_at || company.created_at || new Date()).toISOString(),
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

    const cacheKey = `companies-${locale}`;

    console.log(`[Companies Sitemap] Generating chunk ${chunkId} for locale ${locale}`);

    // Try to load cached data
    let cachedData = await loadSitemapCache(cacheKey);
    let chunks = [];
    let stats = null;

    if (cachedData && cachedData.chunks && cachedData.lastGenerated) {
      const cacheAge = Date.now() - new Date(cachedData.lastGenerated).getTime();
      const MAX_CACHE_AGE = 12 * 60 * 60 * 1000; // 12 hours

      if (cacheAge < MAX_CACHE_AGE) {
        console.log(`[Companies Sitemap] Using cached data`);
        chunks = cachedData.chunks;
        stats = cachedData.stats;
      } else {
        console.log(`[Companies Sitemap] Cache expired, performing incremental update`);

        // Fetch fresh companies
        const [country_slug, lang] = locale.split("-");
        const companies = await fetchAllCompanies(country_slug, lang);

        const newEntries = companiesToSitemapEntries(companies || [], locale);

        // Detect changes
        const oldEntries = cachedData.chunks.flat();
        const changes = detectSitemapChanges(oldEntries, newEntries);

        console.log(`[Companies Sitemap] Changes detected:`, {
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

        console.log(`[Companies Sitemap] Cache updated:`, stats);
      }
    } else {
      console.log(`[Companies Sitemap] No cache found, generating from scratch`);

      // Fetch all companies
      const [country_slug, lang] = locale.split("-");
      const companies = await fetchAllCompanies(country_slug, lang);

      const entries = companiesToSitemapEntries(companies || [], locale);

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

      console.log(`[Companies Sitemap] Initial cache created:`, stats);
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
          ? [`${BASE_URL}/${locale}/companies/sitemap-v2?id=0`]
          : [],
      }, null, 2);

      console.log(`[Companies Sitemap] Chunk ${chunkId} not found. Available chunks: 0-${chunks.length - 1}`);

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
        "Cache-Control": "s-maxage=43200, stale-while-revalidate",
        "X-Sitemap-Chunk": `${chunkId}/${chunks.length}`,
        "X-Sitemap-URLs": chunkEntries.length.toString(),
        "X-Sitemap-Size": Buffer.byteLength(xml, 'utf8').toString(),
      },
    });
  } catch (error) {
    console.error("Error generating companies sitemap chunk:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}

// Helper to get chunk count
export async function getCompanyChunkCount(locale) {
  const cacheKey = `companies-${locale}`;
  const cachedData = await loadSitemapCache(cacheKey);

  if (cachedData && cachedData.chunks) {
    return cachedData.chunks.length;
  }

  return 1;
}
