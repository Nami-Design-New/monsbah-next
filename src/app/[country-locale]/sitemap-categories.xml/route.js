import serverAxios from "@/libs/axios/severAxios";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get categories for a specific locale with proper language
async function getAllCategoriesForSitemap(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    
    // Fetch categories with proper language headers
    const res = await serverAxios.get("/client/categories", {
      headers: {
        "Accept-Language": lang,
        "lang": lang,
      },
      params: {
        country_slug,
      }
    });
    
    if (res?.status === 200) {
      const categories = res.data.data.data || [];
      return Array.isArray(categories) ? categories : [];
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
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

    // Get categories data for this specific locale
    const categories = await getAllCategoriesForSitemap(locale);

    // Add category pages for this locale only with query parameter routing
    categories.forEach((category) => {
      if (category?.slug) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}?category=${encodeURIComponent(category.slug)}`,
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
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "X-Categories-Count": categories.length.toString(),
        "X-Generation-Time": `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error("Error generating categories sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
