import { BASE_URL } from "@/utils/constants";
import serverAxios from "@/libs/axios/severAxios";
import fs from 'fs';
import path from 'path';

// Configuration - 10,000 URLs per sitemap
const isDev = process.env.NODE_ENV === "development";
const MAX_URLS_PER_SITEMAP = 10000;
const MAX_SITEMAP_SIZE = 50 * 1024 * 1024;
const MAX_PARALLEL_REQUESTS = 5;
const REQUEST_TIMEOUT = isDev ? 10000 : 30000;
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_DURATION = isDev ? 1000 * 60 * 60 : 1000 * 60 * 5;

// Use ISR with on-demand revalidation
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes
export const fetchCache = "force-cache";
export const maxDuration = 60;

// Pre-generate first 10 sitemaps for each locale
export async function generateStaticParams() {
  if (isDev) {
    return [{ "country-locale": "kw-en", sitemap: "sitemap0.xml" }];
  }
  
  const locales = [
    "sa-ar", "sa-en",
    "kw-ar", "kw-en",
    "ae-ar", "ae-en",
    "bh-ar", "bh-en",
    "om-ar", "om-en",
    "qa-ar", "qa-en"
  ];
  
  const params = [];
  
  locales.forEach(locale => {
    for (let i = 0; i < 10; i++) {
      params.push({
        "country-locale": locale,
        sitemap: `sitemap${i}.xml`
      });
    }
  });
  
  return params;
}

// Helper: Get cached data
function getCachedData(cacheKey) {
  if (!isDev) return null;
  
  try {
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_DURATION) {
        console.log(`[Cache] Using cached data (age: ${Math.round(age/1000)}s)`);
        return cached.data;
      }
    }
  } catch (error) {
    console.error('[Cache] Read error:', error.message);
  }
  return null;
}

// Helper: Save cached data
function saveCachedData(cacheKey, data) {
  if (!isDev) return;
  
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
    fs.writeFileSync(cacheFile, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
    console.log(`[Cache] Saved to cache`);
  } catch (error) {
    console.error('[Cache] Write error:', error.message);
  }
}

// Helper: Fetch with timeout
async function fetchWithTimeout(page, lang, country_slug) {
  return Promise.race([
    serverAxios.get("/client/companies", {
      headers: {
        "Accept-Language": lang,
        "lang": lang,
      },
      params: {
        country_slug,
        page,
        per_page: 50
      }
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
    )
  ]);
}

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    const resolvedParams = await params;
    const sitemapParam = resolvedParams.sitemap || "sitemap0.xml";
    const id = parseInt(sitemapParam.replace('sitemap', '').replace('.xml', '')) || 0;
    const locale = resolvedParams["country-locale"] || "sa-ar";
    const [country_slug, lang] = locale.split("-");

    console.log(`[Companies Sitemap ${id}] Starting generation for ${locale} (max: ${MAX_URLS_PER_SITEMAP} URLs)`);

    // Check cache first
    const cacheKey = `companies-all-${locale}`;
    let allCompanies = getCachedData(cacheKey);
    
    if (!allCompanies || allCompanies.length === 0) {
      console.log(`[Companies Sitemap ${id}] Fetching ALL companies from API...`);
      
      allCompanies = [];
      let currentPage = 1;
      let hasMoreData = true;
      
      while (hasMoreData && allCompanies.length < 100000) {
        const pageBatch = [];
        for (let i = 0; i < MAX_PARALLEL_REQUESTS; i++) {
          pageBatch.push(currentPage + i);
        }
        
        console.log(`[Companies Sitemap ${id}] Fetching pages ${pageBatch[0]}-${pageBatch[pageBatch.length - 1]}...`);
        
        const results = await Promise.allSettled(
          pageBatch.map(page => fetchWithTimeout(page, lang, country_slug))
        );
        
        let emptyCount = 0;
        for (const result of results) {
          if (result.status === 'fulfilled') {
            const list = result.value?.data?.data?.data || [];
            if (list.length === 0) {
              emptyCount++;
            } else {
              allCompanies.push(...list);
            }
          }
        }
        
        if (emptyCount === results.length) {
          hasMoreData = false;
          console.log(`[Companies Sitemap ${id}] Reached end of data at page ${currentPage}`);
        }
        
        currentPage += MAX_PARALLEL_REQUESTS;
        console.log(`[Companies Sitemap ${id}] Total companies fetched: ${allCompanies.length}`);
      }
      
      if (allCompanies.length > 0) {
        saveCachedData(cacheKey, allCompanies);
        console.log(`[Companies Sitemap ${id}] Cached ${allCompanies.length} total companies`);
      }
    } else {
      console.log(`[Companies Sitemap ${id}] Using ${allCompanies.length} companies from cache`);
    }
    
    // Slice companies for THIS sitemap
    const startIndex = id * MAX_URLS_PER_SITEMAP;
    const endIndex = startIndex + MAX_URLS_PER_SITEMAP;
    const companies = allCompanies.slice(startIndex, endIndex);
    
    console.log(`[Companies Sitemap ${id}] This sitemap contains companies ${startIndex}-${endIndex} (${companies.length} items)`);

    const generationTime = Date.now() - startTime;
    console.log(`[Companies Sitemap ${id}] Generated with ${companies.length} companies in ${generationTime}ms`);

    // Generate XML with size checking
    const currentDate = new Date().toISOString();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    const urlEntries = [];
    let currentSize = Buffer.byteLength(xml, 'utf8');
    
    for (const company of companies) {
      if (!company?.slug || !company?.id) continue;
      
      const urlEntry = `  <url>
    <loc>${BASE_URL}/${locale}/company/${company.slug}-id=${company.id}</loc>
    <lastmod>${company.updated_at || company.created_at || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      
      const entrySize = Buffer.byteLength(urlEntry, 'utf8');
      
      if (currentSize + entrySize + 10 > MAX_SITEMAP_SIZE) {
        console.log(`[Companies Sitemap ${id}] Size limit reached at ${urlEntries.length} URLs`);
        break;
      }
      
      urlEntries.push(urlEntry);
      currentSize += entrySize;
    }
    
    xml += urlEntries.join('');
    xml += `</urlset>`;
    
    const finalSize = Buffer.byteLength(xml, 'utf8');
    const sizeMB = (finalSize / (1024 * 1024)).toFixed(2);
    
    console.log(`[Companies Sitemap ${id}] Final: ${urlEntries.length} URLs, ${sizeMB}MB`);

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "X-Companies-Count": urlEntries.length.toString(),
        "X-Total-Companies": allCompanies.length.toString(),
        "X-Generation-Time": `${generationTime}ms`,
        "X-Sitemap-ID": id.toString(),
        "X-Size-MB": sizeMB,
      },
    });
  } catch (error) {
    console.error("Error generating companies sitemap:", error);
    
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
