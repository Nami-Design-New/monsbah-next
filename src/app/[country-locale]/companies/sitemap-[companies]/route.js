import getCompanies from "@/services/companies/getCompanies";
import { BASE_URL } from "@/utils/constants";

// Google limits
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const dynamic = "force-dynamic";

// Helper: Estimate XML size for a URL entry
function estimateEntrySize(url, lastmod) {
  // Rough estimate of XML entry size in bytes
  const entry = `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  return new Blob([entry]).size;
}

// Function to get all companies for sitemap with chunking info
async function getAllCompaniesForSitemap(locale) {
  try {
    const [country_slug] = locale.split("-");
    
    const allCompanies = [];
    let page = 1;
    let hasMore = true;
    
    // Fetch all companies with pagination (increased limit for chunking)
    while (hasMore && page <= 100) { // Allow more pages since we'll chunk
      try {
        const response = await getCompanies({
          country_slug,
          pageParam: page,
        });
        
        const companies = response?.data?.data || [];
        
        if (companies.length > 0) {
          allCompanies.push(...companies);
          hasMore = Boolean(response?.data?.links?.next);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching companies page ${page}:`, error);
        hasMore = false;
      }
    }
    
    return allCompanies;
  } catch (error) {
    console.error("Error fetching companies for sitemap:", error);
    return [];
  }
}

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    
    // Extract chunk ID from dynamic route (e.g., "companies0.xml" or "companies1.xml")
    const chunkParam = resolvedParams.companies || "companies0.xml";
    const chunkId = parseInt(chunkParam.replace('companies', '').replace('.xml', '')) || 0;
    
    const locale = resolvedParams["country-locale"] || "kw-ar";

    // Get ALL companies
    const allCompanies = await getAllCompaniesForSitemap(locale);
    
    // Smart chunking by URL count AND file size
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const xmlFooter = `</urlset>`;
    const headerFooterSize = new Blob([xmlHeader + xmlFooter]).size;
    
    for (const company of allCompanies) {
      if (!company?.slug && !company?.id) continue;
      
      const companyIdentifier = company.slug || company.id;
      const url = `${BASE_URL}/${locale}/company-details/${companyIdentifier}`;
      const lastmod = new Date(company.updated_at || company.created_at || new Date()).toISOString();
      
      const entrySize = estimateEntrySize(url, lastmod);
      
      // Check if adding this entry would exceed limits
      if (
        currentChunk.length >= MAX_URLS_PER_SITEMAP ||
        (currentSize + entrySize + headerFooterSize) >= MAX_FILE_SIZE_BYTES
      ) {
        // Start a new chunk
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [];
          currentSize = 0;
        }
      }
      
      currentChunk.push({ url, lastmod, company });
      currentSize += entrySize;
    }
    
    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    // If requested chunk doesn't exist, return 404
    if (chunkId >= chunks.length) {
      return new Response("Sitemap chunk not found", { status: 404 });
    }
    
    // Get the requested chunk
    const chunkData = chunks[chunkId];
    
    // Generate XML for this chunk
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
        "X-Companies-Count": chunkData.length.toString(),
        "X-Total-Companies": allCompanies.length.toString(),
        "X-Total-Chunks": chunks.length.toString(),
        "X-Current-Chunk": chunkId.toString(),
        "X-File-Size": `${(xmlSize / 1024).toFixed(2)}KB`,
        "X-Generation-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("Error generating companies sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
