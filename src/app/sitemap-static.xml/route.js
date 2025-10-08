import { LOCALES } from "@/i18n/routing";
import { BASE_URL } from "@/utils/constants";

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

export async function GET() {
  try {
    const sitemapEntries = [];

    // Add static pages for all locales
    LOCALES.forEach((locale) => {
      STATIC_PAGES.forEach((pageConfig) => {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}${pageConfig.path}`,
          lastModified: new Date(),
          changeFrequency: pageConfig.changeFreq,
          priority: pageConfig.priority,
        });
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
    console.error("Error generating static sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}