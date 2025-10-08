import getCompanies from "@/services/companies/getCompanies";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get all companies for sitemap
async function getAllCompaniesForSitemap(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    
    // Fetch companies - you may need to adjust this based on your API structure
    const companies = await getCompanies({
      lang,
      country_slug,
      // Add any other parameters your API needs
    });
    return companies || [];
  } catch (error) {
    console.error("Error fetching companies for sitemap:", error);
    return [];
  }
}

export async function GET(request, { params }) {
  try {
    const sitemapEntries = [];
    const locale = params["country-locale"] || "kw-ar";

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
        "Content-Type": "text/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating companies sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
