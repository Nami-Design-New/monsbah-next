export const dynamic = "force-dynamic";

export async function GET() {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Main sitemap index",
    "Sitemap: https://monsbah.com/sitemap.xml",
    "",
    "# Specific sitemaps for better crawling",
    "Sitemap: https://monsbah.com/sitemap-images.xml",
    "Sitemap: https://monsbah.com/sitemap-news.xml",
    "",
    "# Disallow admin and private areas",
    "Disallow: /api/",
    "Disallow: /admin/",
    "Disallow: /_next/",
    "Disallow: /auth/",
    "",
    "# Allow all search engines to crawl images",
    "User-agent: Googlebot-Image",
    "Allow: /public/",
    "Allow: /*.jpg",
    "Allow: /*.jpeg",
    "Allow: /*.png",
    "Allow: /*.gif",
    "Allow: /*.webp",
    "Allow: /*.svg",
    "",
    "# Mobile-specific crawler",
    "User-agent: Googlebot-Mobile",
    "Allow: /",
    "",
    "# News crawler for blog content",
    "User-agent: Googlebot-News",
    "Allow: /*/blogs/",
    "",
    "# Crawl-delay for aggressive bots",
    "User-agent: *",
    "Crawl-delay: 1",
    "",
    "# Host directive for consistency",
    "Host: https://monsbah.com",
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
