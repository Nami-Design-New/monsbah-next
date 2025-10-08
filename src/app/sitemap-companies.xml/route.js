import { LOCALES } from "@/i18n/routing";
import getCompanies from "@/services/companies/getCompanies";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get all companies for sitemap
async function getAllCompaniesForSitemap() {
  try {
    // Fetch companies - you may need to adjust this based on your API
    const companies = await getCompanies();
    return companies || [];
  } catch (error) {
    console.error("Error fetching companies for sitemap:", error);
    return [];
  }
}

export async function GET() {
  try {
    const sitemapEntries = [];

    // Get companies data
    const companies = await getAllCompaniesForSitemap();

    // Add company pages for all locales
    LOCALES.forEach((locale) => {
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
        "Content-Type": "text/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating companies sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
