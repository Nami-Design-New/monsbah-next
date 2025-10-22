import { BASE_URL } from "@/utils/constants";
import { getCategories } from "@/services/categories/getCategories";
import getAllCompanies from "@/services/companies/getAllCompanies";
import getProducts from "@/services/products/getProducts";
import { getBlogs } from "@/services/blogs/getBlogs";
import {
  generateSitemapIndexXML,
  getSitemapEntriesForIndex,
  calculateChunks,
} from "@/utils/sitemap-utils";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { "country-locale": locale } = await params;
  const [country_slug, lang] = locale.split("-");

  // Ensure downstream requests pick up locale-specific language
  const { cookies: setCookie } = await import("next/headers");
  const cookieStore = await setCookie();
  cookieStore.set("NEXT_LOCALE", locale);

  const sitemapEntries = [];

  try {
    // 1. Static pages sitemap (always single file)
    sitemapEntries.push({
      loc: `${BASE_URL}/${locale}/sitemap-static.xml`,
      lastmod: new Date().toISOString(),
    });

    // 2. Categories sitemap (with auto-chunking detection)
    const categoriesEntries = await getSitemapEntriesForIndex({
      locale,
      sitemapType: "categories",
      cacheKey: `sitemap-categories-${locale}`,
      fetchDataFn: async () => {
        const endpoint = `/client/categories?country_slug=${country_slug}&lang=${lang}`;
        const categories = await getCategories(endpoint);
        return Array.isArray(categories) ? categories : [];
      },
      transformToUrlsFn: (categories) => {
        return categories.map((category) => ({
          url: `${BASE_URL}/${locale}/category/${category.slug || category.id}`,
        }));
      },
    });
    sitemapEntries.push(...categoriesEntries);

    // 3. Products sitemap - FAST: only fetch first page to get total, then generate chunk URLs
    try {
      // Fetch first page only to get total count
      const response = await getProducts({
        pageParam: 1,
        lang,
        country_slug,
        user: "client",
      });

      const total =
        response?.data?.meta?.total ||
        response?.meta?.total ||
        response?.data?.total ||
        response?.total ||
        0;

      const productChunks = total > 0 ? calculateChunks(total) : 1;
      console.log(`[Products Sitemap] ${locale}: ${total} products, ${productChunks} chunks`);

      // Generate sitemap URLs for each chunk
      for (let i = 0; i < Math.max(productChunks, 1); i++) {
        sitemapEntries.push({
          loc: `${BASE_URL}/${locale}/sitemap-products${i}.xml`,
          lastmod: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Products sitemap failed:", error.message);
    }

    // Always include base companies sitemap reference
    sitemapEntries.push({
      loc: `${BASE_URL}/${locale}/sitemap-companies.xml`,
      lastmod: new Date().toISOString(),
    });

    // 4. Companies sitemap (with auto-chunking detection)
    try {
      const companiesPromise = getSitemapEntriesForIndex({
        locale,
        sitemapType: "companies",
        cacheKey: `sitemap-companies-${locale}`,
        fetchDataFn: async () => {
          try {
            const fetchPromise = getAllCompanies({ country_slug, lang });
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Companies API timeout after 15s")), 15000)
            );
            const companies = await Promise.race([fetchPromise, timeoutPromise]);
            return Array.isArray(companies) ? companies : [];
          } catch (error) {
            console.error("Error fetching companies for sitemap:", error);
            return [];
          }
        },
        transformToUrlsFn: (companies) => {
          return companies.map((company) => ({
            url: `${BASE_URL}/${locale}/company-details/${company.slug || company.id}`,
          }));
        },
      });

      const companiesEntries = await companiesPromise;
      sitemapEntries.push(...companiesEntries);
    } catch (error) {
      console.error("Companies sitemap timed out or failed, skipping:", error.message);
      // Skip companies if it fails
    }

    // 4. Blogs sitemap (with auto-chunking detection)
    const blogsEntries = await getSitemapEntriesForIndex({
      locale,
      sitemapType: "blogs",
      cacheKey: `sitemap-blogs-${locale}`,
      fetchDataFn: async () => {
        const blogs = await getBlogs();
        return Array.isArray(blogs) ? blogs : [];
      },
      transformToUrlsFn: (blogs) => {
        return blogs.map((blog) => ({
          url: `${BASE_URL}/${locale}/blogs/${blog.id}`,
        }));
      },
    });
    sitemapEntries.push(...blogsEntries);

  } catch (error) {
    console.error("Error generating sitemap index:", error);
  }

  // Generate sitemap index XML
  const xml = generateSitemapIndexXML(sitemapEntries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
