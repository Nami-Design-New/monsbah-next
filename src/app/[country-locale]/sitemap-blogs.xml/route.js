import { getBlogs } from "@/services/blogs/getBlogs";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get all blogs for sitemap
async function getAllBlogsForSitemap(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    
    // Fetch blogs for this specific locale
    const blogs = await getBlogs({
      lang,
      country_slug,
      per_page: 1000, // Get comprehensive blog list
      // Add other parameters as needed
    });
    return blogs || [];
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
    return [];
  }
}

export async function GET(request, { params }) {
  try {
    const sitemapEntries = [];
    const locale = params["country-locale"] || "kw-ar";

    // Get blogs data for this specific locale
    const blogs = await getAllBlogsForSitemap(locale);

    // Add dynamic blog pages for this locale only
    blogs.forEach((blog) => {
      if (blog?.slug || blog?.id) {
        // Use slug if available, otherwise use id
        const blogIdentifier = blog.slug || blog.id;
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/blogs/${blogIdentifier}`,
          lastModified: new Date(
            blog.updated_at || blog.created_at || new Date()
          ),
          changeFrequency: "monthly",
          priority: 0.7, // Good priority for content
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
    console.error("Error generating blogs sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
