import { LOCALES } from "@/i18n/routing";
import getProducts from "@/services/products/getProducts";
import getCompanies from "@/services/companies/getCompanies";
import { getCategories } from "@/services/categories/getCategories";
import { getBlogs } from "@/services/blogs/getBlogs";
import { BASE_URL } from "@/utils/constants";

export const dynamic = "force-dynamic";

const MAX_URLS_PER_SITEMAP = 50000;

// Calculate chunk count for products
async function getProductsChunkCount(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    const data = await getProducts({
      pageParam: 1,
      lang,
      country_slug,
      user: "client",
    });

    const total =
      data?.total ||
      data?.data?.total ||
      data?.meta?.total ||
      data?.data?.meta?.total ||
      0;

    return total > 0 ? Math.ceil(total / MAX_URLS_PER_SITEMAP) : 1;
  } catch {
    return 1;
  }
}

// Calculate chunk count for companies
async function getCompaniesChunkCount(locale) {
  try {
    const [country_slug] = locale.split("-");
    
    let total = 0;
    let page = 1;
    let hasMore = true;
    
    // Quick count by checking first few pages
    while (hasMore && page <= 3) {
      const response = await getCompanies({
        country_slug,
        pageParam: page,
      });
      
      const companies = response?.data?.data || [];
      total += companies.length;
      hasMore = Boolean(response?.data?.links?.next);
      
      if (!hasMore) break;
      page++;
    }
    
    // Estimate total based on first 3 pages
    const meta = await getCompanies({ country_slug, pageParam: 1 });
    const estimatedTotal = meta?.data?.meta?.total || total;
    
    return estimatedTotal > MAX_URLS_PER_SITEMAP ? Math.ceil(estimatedTotal / MAX_URLS_PER_SITEMAP) : 1;
  } catch {
    return 1;
  }
}

// Calculate chunk count for categories
async function getCategoriesChunkCount(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    const endpoint = `/client/categories?country_slug=${country_slug}&lang=${lang}`;
    const categories = await getCategories(endpoint);
    const count = Array.isArray(categories) ? categories.length : 0;
    
    return count > MAX_URLS_PER_SITEMAP ? Math.ceil(count / MAX_URLS_PER_SITEMAP) : 1;
  } catch {
    return 1;
  }
}

// Calculate chunk count for blogs
async function getBlogsChunkCount(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    
    let total = 0;
    let page = 1;
    
    // Sample first page to estimate
    const response = await getBlogs({
      lang,
      country_slug,
      page,
      per_page: 100,
    });
    
    const blogs = Array.isArray(response) ? response : (response?.data || []);
    total = blogs.length;
    
    // If there's a total in meta, use that
    if (response?.meta?.total) {
      total = response.meta.total;
    }
    
    return total > MAX_URLS_PER_SITEMAP ? Math.ceil(total / MAX_URLS_PER_SITEMAP) : 1;
  } catch {
    return 1;
  }
}

export async function GET() {
  try {
    const sitemapPaths = [];
    const currentDate = new Date().toISOString();

    // Process each locale
    for (const locale of LOCALES) {
      // 1. Static pages sitemap (always 1 chunk)
      sitemapPaths.push({
        loc: `${BASE_URL}/${locale}/sitemap-static.xml`,
        lastmod: currentDate,
      });
      
      // 2. Categories sitemap (chunked if > 50k)
      const categoriesChunks = await getCategoriesChunkCount(locale);
      if (categoriesChunks === 1) {
        sitemapPaths.push({
          loc: `${BASE_URL}/${locale}/sitemap-categories.xml`,
          lastmod: currentDate,
        });
      } else {
        for (let i = 0; i < categoriesChunks; i++) {
          sitemapPaths.push({
            loc: `${BASE_URL}/${locale}/categories/sitemap-categories${i}.xml`,
            lastmod: currentDate,
          });
        }
      }
      
      // 3. Companies sitemap (chunked if > 50k)
      const companiesChunks = await getCompaniesChunkCount(locale);
      if (companiesChunks === 1) {
        sitemapPaths.push({
          loc: `${BASE_URL}/${locale}/sitemap-companies.xml`,
          lastmod: currentDate,
        });
      } else {
        for (let i = 0; i < companiesChunks; i++) {
          sitemapPaths.push({
            loc: `${BASE_URL}/${locale}/companies/sitemap-companies${i}.xml`,
            lastmod: currentDate,
          });
        }
      }
      
      // 4. Blogs sitemap (chunked if > 50k)
      const blogsChunks = await getBlogsChunkCount(locale);
      if (blogsChunks === 1) {
        sitemapPaths.push({
          loc: `${BASE_URL}/${locale}/sitemap-blogs.xml`,
          lastmod: currentDate,
        });
      } else {
        for (let i = 0; i < blogsChunks; i++) {
          sitemapPaths.push({
            loc: `${BASE_URL}/${locale}/blogs/sitemap-blogs${i}.xml`,
            lastmod: currentDate,
          });
        }
      }

      // 5. Products sitemaps (chunked)
      const productsChunks = await getProductsChunkCount(locale);
      for (let i = 0; i < productsChunks; i++) {
        sitemapPaths.push({
          loc: `${BASE_URL}/${locale}/products/sitemap${i}.xml`,
          lastmod: currentDate,
        });
      }
    }

    // Add global sitemaps (not locale-specific)
    sitemapPaths.push({
      loc: `${BASE_URL}/sitemap-images.xml`,
      lastmod: currentDate,
    });
    
    sitemapPaths.push({
      loc: `${BASE_URL}/sitemap-news.xml`,
      lastmod: currentDate,
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths
  .map((sitemap) => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`)
  .join("\n")}
</sitemapindex>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap index:", error);
    return new Response("Error generating sitemap index", { status: 500 });
  }
}
