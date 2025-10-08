import { LOCALES } from "@/i18n/routing";
import { getCategories } from "@/services/categories/getCategories";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get all categories for sitemap  <mcreference link="https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap" index="1">1</mcreference>
async function getAllCategoriesForSitemap() {
  try {
    const categories = await getCategories();
    return categories || [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export async function GET() {
  try {
    const sitemapEntries = [];

    // Get categories data  <mcreference link="https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap" index="1">1</mcreference>
    const categories = await getAllCategoriesForSitemap();

    // Add category pages for all locales
    LOCALES.forEach((locale) => {
      categories.forEach((category) => {
        if (category?.slug) {
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
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
        "Content-Type": "text/xml",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating categories sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}