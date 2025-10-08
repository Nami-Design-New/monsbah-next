import { LOCALES } from "@/i18n/routing";
import { getBlogs } from "@/services/blogs/getBlogs";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

// Function to get recent blogs for news sitemap (last 2 days)
async function getRecentBlogsForNews() {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const allRecentBlogs = [];
    
    // Fetch blogs for all locales to get comprehensive coverage
    for (const locale of LOCALES) {
      const [country_slug, lang] = locale.split("-");
      
      try {
        const blogs = await getBlogs({
          lang,
          country_slug,
          per_page: 100, // Reasonable limit for news
          // Add date filter if your API supports it
          // created_at_gte: twoDaysAgo.toISOString(),
        });
        
        if (blogs && Array.isArray(blogs)) {
          // Filter blogs from last 2 days and add locale info
          const recentBlogs = blogs
            .filter(blog => {
              const blogDate = new Date(blog.created_at || blog.published_at);
              return blogDate >= twoDaysAgo && blogDate <= new Date();
            })
            .map(blog => ({ ...blog, locale }));
          
          allRecentBlogs.push(...recentBlogs);
        }
      } catch (error) {
        console.error(`Error fetching blogs for locale ${locale}:`, error);
        continue;
      }
    }
    
    // Remove duplicates based on slug or id
    const uniqueBlogs = allRecentBlogs.filter((blog, index, self) =>
      index === self.findIndex(b => 
        (b.slug && blog.slug && b.slug === blog.slug) || 
        (b.id && blog.id && b.id === blog.id)
      )
    );
    
    return uniqueBlogs;
  } catch (error) {
    console.error("Error fetching recent blogs for news sitemap:", error);
    return [];
  }
}

// Helper function to clean text for XML
function cleanTextForXML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

export async function GET() {
  try {
    const sitemapEntries = [];

    // Get recent blogs data
    const recentBlogs = await getRecentBlogsForNews();

    // Only include if we have recent content
    if (recentBlogs.length === 0) {
      // Return empty sitemap instead of 404 for better SEO
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
      
      return new Response(emptyXml, {
        status: 200,
        headers: {
          "Content-Type": "text/xml; charset=UTF-8",
          "Cache-Control": "s-maxage=1800, stale-while-revalidate", // 30 min cache for empty
        },
      });
    }

    // Add recent blog entries
    recentBlogs.forEach((blog) => {
      if (blog?.slug || blog?.id) {
        const blogIdentifier = blog.slug || blog.id;
        const publicationDate = new Date(blog.created_at || blog.published_at || new Date());
        const locale = blog.locale;
        const language = locale.split('-')[1]; // Extract language code
        
        // Validate publication date is within Google News requirements (last 2 days)
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
        
        if (publicationDate >= twoDaysAgo && publicationDate <= now) {
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/blogs/${blogIdentifier}`,
            publicationDate: publicationDate.toISOString(),
            title: cleanTextForXML(blog.title || blog.name || `Blog ${blog.id}`),
            language: language,
            keywords: cleanTextForXML(blog.tags || blog.keywords || ""),
          });
        }
      }
    });

    // Generate XML news sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${sitemapEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <news:news>
      <news:publication>
        <news:name>Monsbah</news:name>
        <news:language>${entry.language}</news:language>
      </news:publication>
      <news:publication_date>${entry.publicationDate}</news:publication_date>
      <news:title><![CDATA[${entry.title}]]></news:title>
      ${entry.keywords ? `<news:keywords><![CDATA[${entry.keywords}]]></news:keywords>` : ''}
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate", // Shorter cache for news
      },
    });
  } catch (error) {
    console.error("Error generating news sitemap:", error);
    return new Response("Error generating news sitemap", { status: 500 });
  }
}
