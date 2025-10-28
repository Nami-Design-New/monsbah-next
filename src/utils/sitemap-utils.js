import { BASE_URL } from "@/utils/constants";

// Maximum URLs per sitemap file (Google recommends 50,000, but you want 10,000)
export const MAX_URLS_PER_SITEMAP = 10000;

// Cache duration in seconds (0 = no cache)
// For production: use 86400 (24 hours)
// For testing: use 300 (5 minutes) to avoid repeated slow API calls
export const CACHE_DURATION = 300;

/**
 * In-memory cache for sitemap data
 * Structure: { key: { data, timestamp } }
 */
const sitemapCache = new Map();

/**
 * Check if cached data is still valid (less than 24 hours old)
 */
function isCacheValid(timestamp) {
  const now = Date.now();
  const age = (now - timestamp) / 1000; // Convert to seconds
  return age < CACHE_DURATION;
}

/**
 * Get data from cache if valid
 */
export function getCachedData(cacheKey) {
  const cached = sitemapCache.get(cacheKey);
  
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`[Sitemap Cache] HIT for key: ${cacheKey}`);
    return cached.data;
  }
  
  console.log(`[Sitemap Cache] MISS for key: ${cacheKey}`);
  return null;
}

/**
 * Store data in cache
 */
export function setCachedData(cacheKey, data) {
  sitemapCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
  console.log(`[Sitemap Cache] SET for key: ${cacheKey}`);
}

/**
 * Clear specific cache entry
 */
export function clearCache(cacheKey) {
  sitemapCache.delete(cacheKey);
  console.log(`[Sitemap Cache] CLEARED for key: ${cacheKey}`);
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  sitemapCache.clear();
  console.log(`[Sitemap Cache] CLEARED ALL`);
}

/**
 * Calculate total number of chunks needed
 */
export function calculateChunks(totalItems) {
  return Math.ceil(totalItems / MAX_URLS_PER_SITEMAP);
}

/**
 * Get items for a specific chunk
 */
export function getChunkItems(items, chunkIndex) {
  const start = chunkIndex * MAX_URLS_PER_SITEMAP;
  const end = start + MAX_URLS_PER_SITEMAP;
  return items.slice(start, end);
}

/**
 * Generate sitemap XML for URLs
 */
export function generateSitemapXML(urls) {
  const urlEntries = urls
    .map((entry) => {
      const loc = entry.url || entry.loc;
      const lastmod = entry.lastModified || entry.lastmod || new Date().toISOString();
      const changefreq = entry.changeFrequency || entry.changefreq || "weekly";
      const priority = entry.priority !== undefined ? entry.priority : 0.5;

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate sitemap XML with image support for products
 * @param {Array} urls - Array of URL entries with optional images
 */
export function generateImageSitemapXML(urls) {
  const hasVideoEntries = urls.some(
    (entry) => Array.isArray(entry.videos) && entry.videos.length > 0
  );

  const urlEntries = urls
    .map((entry) => {
      const loc = entry.url || entry.loc;
      const lastmod = entry.lastModified || entry.lastmod || null;
      const changefreq = entry.changeFrequency || entry.changefreq || null;
      const priority =
        entry.priority !== undefined && entry.priority !== null
          ? entry.priority
          : null;

      const urlLines = [`  <url>`];

      if (entry.id) {
        urlLines.push(`    <id>${entry.id}</id>`);
      }

      urlLines.push(`    <loc>${loc}</loc>`);

      if (lastmod) {
        urlLines.push(`    <lastmod>${lastmod}</lastmod>`);
      }

      if (changefreq) {
        urlLines.push(`    <changefreq>${changefreq}</changefreq>`);
      }

      if (priority !== null) {
        urlLines.push(`    <priority>${priority}</priority>`);
      }

      if (entry.images && Array.isArray(entry.images) && entry.images.length > 0) {
        entry.images.forEach((img) => {
          const imgLines = [
            `    <image:image>`,
            `      <image:loc>${img.url || img.loc}</image:loc>`,
          ];

          urlLines.push(...imgLines, `    </image:image>`);
        });
      }

      if (entry.videos && Array.isArray(entry.videos) && entry.videos.length > 0) {
        entry.videos.forEach((video) => {
          const contentLoc = video.url || video.loc;
          if (!contentLoc) {
            return;
          }

          const thumbnail =
            video.thumbnail || video.thumbnail_loc || video.thumbnailLoc || "";
          const title = video.title || (video.id ? `Media ${video.id}` : "Video");
          const description = video.description || title;

          const videoLines = [
            `    <video:video>`,
            `      <video:content_loc>${contentLoc}</video:content_loc>`,
          ];

          if (thumbnail) {
            videoLines.push(`      <video:thumbnail_loc>${thumbnail}</video:thumbnail_loc>`);
          }

          videoLines.push(
            `      <video:title><![CDATA[${title}]]></video:title>`,
            `      <video:description><![CDATA[${description}]]></video:description>`,
            `    </video:video>`
          );

          urlLines.push(...videoLines);
        });
      }

      urlLines.push(`  </url>`);

      return urlLines.join("\n");
    })
    .join("\n");

  const namespaceParts = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
  ];

  if (hasVideoEntries) {
    namespaceParts.push('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${namespaceParts.join("\n        ")}>
${urlEntries}
</urlset>`;
}

/**
 * Generate sitemap index XML (for listing multiple sitemaps)
 */
export function generateSitemapIndexXML(sitemaps) {
  const sitemapEntries = sitemaps
    .map((entry) => {
      const loc = entry.loc || entry.url;
      const lastmod = entry.lastmod || entry.lastModified || new Date().toISOString();

      return `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Create HTTP Response with proper headers and caching
 */
export function createSitemapResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      // Cache for 24 hours with stale-while-revalidate
      "Cache-Control": `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION}`,
      "X-Robots-Tag": "noindex", // Optional: prevent indexing of sitemap files
    },
  });
}

/**
 * Generate chunked sitemap entries for sitemap index
 * Returns array of sitemap objects for the index
 * 
 * @param {string} locale - The locale (e.g., "kw-ar")
 * @param {string} sitemapType - Type: "products", "companies", "categories", etc.
 * @param {number} totalChunks - Total number of chunks
 * @param {string} lastModified - Last modified date
 * @param {boolean} useNestedPath - If true, uses /{locale}/products/sitemap0.xml format
 */
export function generateChunkedSitemapEntries(
  locale,
  sitemapType,
  totalChunks,
  lastModified = new Date().toISOString(),
  useNestedPath = false
) {
  const entries = [];
  
  for (let i = 0; i < totalChunks; i++) {
    if (useNestedPath && sitemapType === 'products') {
      // New format: /kw-ar/products/sitemap0.xml
      entries.push({
        loc: `${BASE_URL}/${locale}/products/sitemap${i}.xml`,
        lastmod: lastModified,
      });
    } else {
      // Old format: /kw-ar/sitemap-companies0.xml
      entries.push({
        loc: `${BASE_URL}/${locale}/sitemap-${sitemapType}${i}.xml`,
        lastmod: lastModified,
      });
    }
  }
  
  return entries;
}

/**
 * Main function to handle sitemap generation with caching and chunking
 * 
 * @param {string} cacheKey - Unique cache key for this sitemap
 * @param {Function} fetchDataFn - Async function that fetches the data
 * @param {Function} transformToUrlsFn - Function that transforms data to URL entries
 * @param {number} chunkIndex - Optional chunk index (0-based). If undefined, returns all chunks
 * @returns {Promise<string>} - XML string
 */
export async function generateCachedChunkedSitemap({
  cacheKey,
  fetchDataFn,
  transformToUrlsFn,
  chunkIndex = undefined,
  disableCache = false,
}) {
  // Check cache first
  let allUrls = disableCache ? null : getCachedData(cacheKey);
  
  // If not cached or expired, fetch fresh data
  if (!allUrls) {
    const rawData = await fetchDataFn();
    allUrls = transformToUrlsFn(rawData);
    if (!disableCache) {
      setCachedData(cacheKey, allUrls);
    }
  }
  
  // If chunkIndex is provided, return specific chunk
  if (chunkIndex !== undefined) {
    const chunkUrls = getChunkItems(allUrls, chunkIndex);
    return generateSitemapXML(chunkUrls);
  }
  
  // If no chunkIndex, check if we need chunking
  const totalChunks = calculateChunks(allUrls.length);
  
  if (totalChunks === 0) {
    // No URLs available; return empty sitemap
    return generateSitemapXML([]);
  }
  
  if (totalChunks === 1) {
    // Single sitemap, return all URLs
    return generateSitemapXML(allUrls);
  }
  
  // Multiple chunks needed - this shouldn't happen here
  // The caller should handle chunk routing
  throw new Error(
    `Data has ${allUrls.length} items requiring ${totalChunks} chunks. Use chunked routing.`
  );
}

/**
 * Generate image sitemap with caching and chunking support
 * Same as generateCachedChunkedSitemap but uses generateImageSitemapXML
 */
export async function generateCachedChunkedImageSitemap({
  cacheKey,
  fetchDataFn,
  transformToUrlsFn,
  chunkIndex = undefined,
  disableCache = false,
}) {
  // Check cache first
  let allUrls = disableCache ? null : getCachedData(cacheKey);
  
  // If not cached or expired, fetch fresh data
  if (!allUrls) {
    const rawData = await fetchDataFn();
    allUrls = transformToUrlsFn(rawData);
    if (!disableCache) {
      setCachedData(cacheKey, allUrls);
    }
  }
  
  // If chunkIndex is provided, return specific chunk
  if (chunkIndex !== undefined) {
    const chunkUrls = getChunkItems(allUrls, chunkIndex);
    return generateImageSitemapXML(chunkUrls);
  }
  
  // If no chunkIndex, check if we need chunking
  const totalChunks = calculateChunks(allUrls.length);
  
  if (totalChunks === 0) {
    return generateImageSitemapXML([]);
  }
  
  if (totalChunks === 1) {
    // Single sitemap, return all URLs
    return generateImageSitemapXML(allUrls);
  }
  
  // Multiple chunks needed - this shouldn't happen here
  // The caller should handle chunk routing
  throw new Error(
    `Data has ${allUrls.length} items requiring ${totalChunks} chunks. Use chunked routing.`
  );
}

/**
 * Generate sitemap index with automatic chunking detection
 * 
 * @param {string} locale - The country-locale (e.g., 'sa-ar')
 * @param {string} sitemapType - The sitemap type (e.g., 'static', 'categories', 'products')
 * @param {string} cacheKey - Cache key for the data
 * @param {Function} fetchDataFn - Async function that fetches the data
 * @param {Function} transformToUrlsFn - Function that transforms data to URL entries
 * @param {boolean} useNestedPath - If true, uses nested path format for products
 * @returns {Promise<Array>} - Array of sitemap entries for index
 */
export async function getSitemapEntriesForIndex({
  locale,
  sitemapType,
  cacheKey,
  fetchDataFn,
  transformToUrlsFn,
  useNestedPath = false,
  disableCache = false,
}) {
  // Check cache first
  let allUrls = disableCache ? null : getCachedData(cacheKey);
  
  // If not cached or expired, fetch fresh data
  if (!allUrls) {
    const rawData = await fetchDataFn();
    allUrls = transformToUrlsFn(rawData);
    if (!disableCache) {
      setCachedData(cacheKey, allUrls);
    }
  }
  
  const totalChunks = calculateChunks(allUrls.length);
  const lastModified = new Date().toISOString();
  
  if (totalChunks === 1) {
    // Single sitemap
    if (useNestedPath && sitemapType === 'products') {
      return [{
        loc: `${BASE_URL}/${locale}/products/sitemap0.xml`,
        lastmod: lastModified,
      }];
    }
    return [{
      loc: `${BASE_URL}/${locale}/sitemap-${sitemapType}.xml`,
      lastmod: lastModified,
    }];
  }
  
  // Multiple chunks
  return generateChunkedSitemapEntries(locale, sitemapType, totalChunks, lastModified, useNestedPath);
}
