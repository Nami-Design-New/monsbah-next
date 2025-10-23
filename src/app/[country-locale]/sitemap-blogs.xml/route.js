import { BASE_URL } from "@/utils/constants";
import { getBlogs } from "@/services/blogs/getBlogs";
import {
  generateCachedChunkedSitemap,
  createSitemapResponse,
} from "@/utils/sitemap-utils";

export const dynamic = "force-dynamic";

function resolveBlogSlug(blog) {
  const raw = blog?.slug || blog?.title || "";
  return raw
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const locale = resolvedParams["country-locale"];
    
    // Set the language cookie so serverAxios interceptor can use it
    const { cookies: setCookie } = await import("next/headers");
    const cookieStore = await setCookie();
    cookieStore.set("NEXT_LOCALE", locale);
    
    // Fetch blogs first to generate cache key with fingerprint
    // Language is passed via headers by serverAxios interceptor
    const blogsArray = await getBlogs();
    const blogs = Array.isArray(blogsArray) ? blogsArray : [];
    
    // Generate cache fingerprint based on latest update time
    const latestUpdate = blogs.reduce((latest, blog) => {
      const blogTime = new Date(blog.updated_at || blog.created_at || 0).getTime();
      return Math.max(latest, blogTime);
    }, 0);
    
    // Unique cache key including data fingerprint
    const cacheKey = `sitemap-blogs-${locale}-${latestUpdate}`;
    
    // Generate sitemap with caching and automatic chunking
    const xml = await generateCachedChunkedSitemap({
      cacheKey,
      // Fetch function: return already-fetched blogs
      fetchDataFn: async () => {
        return blogs;
      },
      // Transform function: converts blogs to URL entries
      transformToUrlsFn: (blogs) => {
        return blogs.map((blog) => {
          const slug = resolveBlogSlug(blog);
          const encodedSlug = encodeURIComponent(slug);
          return {
            url: `${BASE_URL}/${locale}/blogs/${encodedSlug}`,
            lastModified: new Date(blog.updated_at || blog.created_at || Date.now()).toISOString(),
            changeFrequency: "weekly",
            priority: 0.6,
          };
        });
      },
    });

    return createSitemapResponse(xml);
  } catch (error) {
    console.error("Error generating blogs sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
