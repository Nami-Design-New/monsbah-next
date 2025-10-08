import { getCategories } from "@/services/categories/getCategories";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get all categories for sitemap
async function getAllCategoriesForSitemap(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    
    // Fetch categories for this specific locale
    const categories = await getCategories({
      lang,
      country_slug,
      // Add any other parameters your API needs
    });
    return categories || [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export async function GET(request, { params }) {
  try {
    const sitemapEntries = [];
    const locale = params["country-locale"] || "kw-ar";

    // Get categories data for this specific locale
    const categories = await getAllCategoriesForSitemap(locale);

    // Add category pages for this locale only
    categories.forEach((category) => {
      if (category?.slug) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/${category.slug}`,
          lastModified: new Date(
            category.updated_at || category.created_at || new Date()
          ),
          changeFrequency: "weekly",
          priority: 0.9, // Higher priority for categories
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
        "Content-Type": "text/xml",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating categories sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
