import getCompanies from "@/services/companies/getCompanies";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get all companies for sitemap
async function getAllCompaniesForSitemap(locale) {
  try {
    const [country_slug] = locale.split("-");
    
    const allCompanies = [];
    let page = 1;
    let hasMore = true;
    
    // Fetch all companies with pagination
    while (hasMore && page <= 10) { // Limit to 10 pages (safety)
      try {
        const response = await getCompanies({
          country_slug,
          pageParam: page,
        });
        
        // Extract the companies array from the response
        // The API returns: { data: { data: [...companies] } }
        const companies = response?.data?.data || [];
        
        if (companies.length > 0) {
          allCompanies.push(...companies);
          
          // Check if there are more pages
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
    const locale = resolvedParams["country-locale"] || "kw-ar";
    
    const sitemapEntries = [];

    // Get companies data for this locale
    const companies = await getAllCompaniesForSitemap(locale);

    // Add company pages for this locale
    companies.forEach((company) => {
      if (company?.slug || company?.id) {
        // Use slug if available, otherwise use id
        const companyIdentifier = company.slug || company.id;
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/company-details/${companyIdentifier}`,
          lastModified: new Date(
            company.updated_at || company.created_at || new Date()
          ),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    });

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "X-Companies-Count": companies.length.toString(),
        "X-Generation-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("Error generating companies sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
