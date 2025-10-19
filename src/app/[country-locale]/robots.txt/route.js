export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { "country-locale": locale } = await params;

  const lines = [
    `# Robots.txt for Monsbah.com - ${locale.toUpperCase()}`,
    "# This is a locale-specific robots.txt",
    "# Updated: October 2025",
    "",
    "# Default rule - Allow all crawlers",
    "User-agent: *",
    "Allow: /",
    "",
    "# Disallow private and system areas",
    "Disallow: /api/",
    "Disallow: /admin/",
    "Disallow: /_next/",
    "Disallow: /auth/",
    "Disallow: /*?*auth=",
    "Disallow: /*?*token=",
    "",
    "# Allow crawling of static assets",
    "Allow: /_next/static/",
    "Allow: /_next/image",
    "Allow: /public/",
    "",
    "# Googlebot Image - Allow all images",
    "User-agent: Googlebot-Image",
    "Allow: /",
    "",
    "# Googlebot Mobile - Full access",
    "User-agent: Googlebot-Mobile",
    "Allow: /",
    "",
    "# Googlebot News - Focus on blog content",
    "User-agent: Googlebot-News",
    `Allow: /${locale}/blogs/`,
    `Allow: /${locale}/blog/`,
    "",
    `# Locale-specific sitemap for ${locale}`,
    `Sitemap: https://monsbah.com/${locale}/sitemap.xml`,
    "",
    "# Main sitemap index (all locales)",
    "Sitemap: https://monsbah.com/sitemap.xml",
    "",
    "# Specialized sitemaps for this locale",
    `Sitemap: https://monsbah.com/${locale}/sitemap-static.xml`,
    `Sitemap: https://monsbah.com/${locale}/sitemap-categories.xml`,
    `Sitemap: https://monsbah.com/${locale}/sitemap-companies.xml`,
    `Sitemap: https://monsbah.com/${locale}/sitemap-blogs.xml`,
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
