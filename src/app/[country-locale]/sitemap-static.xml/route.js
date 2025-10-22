import { BASE_URL } from "@/utils/constants";
import {
  generateCachedChunkedSitemap,
  createSitemapResponse,
} from "@/utils/sitemap-utils";

// Static pages that exist for all locales with SEO priorities
const STATIC_PAGES = [
  { path: "/", priority: 1.0, changeFreq: "daily" },
  { path: "/about", priority: 0.9, changeFreq: "monthly" },
  { path: "/contact", priority: 0.8, changeFreq: "monthly" },
  { path: "/terms-and-conditions", priority: 0.5, changeFreq: "yearly" },
  { path: "/categories", priority: 0.9, changeFreq: "weekly" },
  { path: "/companies", priority: 0.8, changeFreq: "daily" },
  { path: "/blogs", priority: 0.7, changeFreq: "daily" },
  { path: "/sections", priority: 0.6, changeFreq: "weekly" },
  { path: "/search", priority: 0.8, changeFreq: "weekly" },
  { path: "/chats", priority: 0.6, changeFreq: "weekly" },
  // Company pages
  { path: "/company-profile", priority: 0.7, changeFreq: "weekly" },
  { path: "/edit-company-profile", priority: 0.5, changeFreq: "monthly" },
  { path: "/add-company-product", priority: 0.6, changeFreq: "weekly" },
  { path: "/company-verification", priority: 0.5, changeFreq: "monthly" },
  { path: "/company-favorites", priority: 0.5, changeFreq: "weekly" },
  { path: "/company-notification", priority: 0.4, changeFreq: "weekly" },
  { path: "/followers", priority: 0.6, changeFreq: "weekly" },
  { path: "/followers/followings", priority: 0.5, changeFreq: "weekly" },
  // Search pages
  { path: "/search/companies", priority: 0.7, changeFreq: "daily" },
  { path: "/search/companies-ads", priority: 0.7, changeFreq: "daily" },
  { path: "/search/persons", priority: 0.6, changeFreq: "weekly" },
  // Profile pages (auth required but good for discovery)
  { path: "/profile", priority: 0.6, changeFreq: "weekly" },
  { path: "/profile/ads", priority: 0.6, changeFreq: "weekly" },
  { path: "/profile/addAd", priority: 0.5, changeFreq: "monthly" },
  { path: "/profile/notifications", priority: 0.4, changeFreq: "weekly" },
  { path: "/profile/favorites", priority: 0.5, changeFreq: "weekly" },
  { path: "/profile/settings", priority: 0.4, changeFreq: "monthly" },
  { path: "/profile/verification", priority: 0.5, changeFreq: "monthly" },
];

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const locale = resolvedParams["country-locale"] || "kw-ar";
    
    // Unique cache key for this locale
    const cacheKey = `sitemap-static-${locale}`;
    
    // Generate sitemap with caching and automatic chunking
    const xml = await generateCachedChunkedSitemap({
      cacheKey,
      // Fetch function: returns static pages data
      fetchDataFn: async () => STATIC_PAGES,
      // Transform function: converts pages to URL entries
      transformToUrlsFn: (pages) => {
        return pages.map((pageConfig) => ({
          url: `${BASE_URL}/${locale}${pageConfig.path}`,
          lastModified: new Date().toISOString(),
          changeFrequency: pageConfig.changeFreq,
          priority: pageConfig.priority,
        }));
      },
    });

    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating static sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
