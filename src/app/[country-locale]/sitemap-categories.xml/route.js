import { BASE_URL } from "@/utils/constants";
import { getCategories } from "@/services/categories/getCategories";
import {
  generateCachedChunkedSitemap,
  createSitemapResponse,
} from "@/utils/sitemap-utils";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const locale = resolvedParams["country-locale"];
    const [country_slug] = locale.split("-");
    
    // Set the language cookie so serverAxios interceptor can use it
    const { cookies: setCookie } = await import("next/headers");
    const cookieStore = await setCookie();
    cookieStore.set("NEXT_LOCALE", locale);
    
    // Fetch categories first to generate cache key with fingerprint
    // Language is passed via headers by serverAxios interceptor, not query params
    const endpoint = `/client/categories?country_slug=${country_slug}`;
    const categories = await getCategories(endpoint);
    const categoriesArray = Array.isArray(categories) ? categories : [];
    
    // Generate cache fingerprint based on latest update time
    // This ensures cache is regenerated when any category is updated
    const latestUpdate = categoriesArray.reduce((latest, cat) => {
      const catTime = new Date(cat.updated_at || cat.created_at || 0).getTime();
      return Math.max(latest, catTime);
    }, 0);
    
    // Unique cache key including data fingerprint
    const cacheKey = `sitemap-categories-${locale}-${latestUpdate}`;
    
    // Generate sitemap with caching and automatic chunking
    const xml = await generateCachedChunkedSitemap({
      cacheKey,
      // Fetch function: return already-fetched categories
      fetchDataFn: async () => {
        return categoriesArray;
      },
      // Transform function: converts categories to URL entries
      transformToUrlsFn: (categories) => {
        return categories.map((category) => {
          // Use the slug field directly - it's always in Arabic across all locales
          // This matches how your frontend routes work (category.slug in SideBar.jsx)
          const slug = category.slug || category.name || category.id;
          
          return {
            url: `${BASE_URL}/${locale}/categories?category=${slug}`,
            lastModified: new Date(category.updated_at || category.created_at || Date.now()).toISOString(),
            changeFrequency: "weekly",
            priority: 0.8,
          };
        });
      },
    });

    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating categories sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
