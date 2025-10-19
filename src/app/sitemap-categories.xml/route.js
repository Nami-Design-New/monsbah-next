import { LOCALES } from "@/i18n/routing";
import serverAxios from "@/libs/axios/severAxios";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to fetch categories with specific language
async function getCategoriesForLang(lang, endpoint = "/client/categories") {
  try {
    const res = await serverAxios.get(endpoint, {
      headers: {
        "Accept-Language": lang,
        "lang": lang,
      }
    });
    if (res?.status === 200) {
      return res.data.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching categories for lang ${lang}:`, error);
    return [];
  }
}

// Function to get categories with proper language support
async function getAllCategoriesForSitemap() {
  try {
    // Fetch categories for both Arabic and English
    const [categoriesAr, categoriesEn] = await Promise.all([
      getCategoriesForLang("ar"),
      getCategoriesForLang("en")
    ]);
    
    return {
      ar: categoriesAr,
      en: categoriesEn
    };
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return { ar: [], en: [] };
  }
}

export async function GET() {
  try {
    const sitemapEntries = [];

    // Get categories data with language support
    const categoriesByLang = await getAllCategoriesForSitemap();

    // Add category pages for all locales with proper routing
    LOCALES.forEach((locale) => {
      const lang = locale.split("-")[1]; // Extract language (ar or en)
      const categories = categoriesByLang[lang] || categoriesByLang.ar; // Fallback to Arabic
      
      categories.forEach((category) => {
        if (category?.slug) {
          // Use new query parameter routing instead of dynamic routes
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/${(category.slug)}`,
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