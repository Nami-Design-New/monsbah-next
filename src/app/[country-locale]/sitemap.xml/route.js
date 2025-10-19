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
    
    while (hasMore && page <= 3) {
      const response = await getCompanies({
        country_slug,
        pageParam: page,
      });

      const pageTotal = response?.data?.data?.length || 0;
      total += pageTotal;

      if (pageTotal < 30) {
        hasMore = false;
      }
      page++;
    }

    return total > 0 ? Math.ceil(total / MAX_URLS_PER_SITEMAP) : 1;
  } catch {
    return 1;
  }
}

// Calculate chunk count for categories
async function getCategoriesChunkCount(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    const data = await getCategories({ country_slug, lang });
    const total = data?.data?.data?.length || 0;
    return total > 0 ? Math.ceil(total / MAX_URLS_PER_SITEMAP) : 1;
  } catch {
    return 1;
  }
}

// Calculate chunk count for blogs
async function getBlogsChunkCount(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    const data = await getBlogs({ country_slug, lang, pageParam: 1 });
    const total = data?.data?.meta?.total || 0;
    return total > 0 ? Math.ceil(total / MAX_URLS_PER_SITEMAP) : 1;
  } catch {
    return 1;
  }
}

export async function GET(request, { params }) {
  const { "country-locale": locale } = await params;

  const productsChunks = await getProductsChunkCount(locale);
  const companiesChunks = await getCompaniesChunkCount(locale);
  const categoriesChunks = await getCategoriesChunkCount(locale);
  const blogsChunks = await getBlogsChunkCount(locale);

  const sitemapEntries = [];

  // Static pages sitemap
  sitemapEntries.push({
    loc: `${BASE_URL}/${locale}/sitemap-static.xml`,
    lastmod: new Date().toISOString(),
  });

  // Categories sitemap
  if (categoriesChunks === 1) {
    sitemapEntries.push({
      loc: `${BASE_URL}/${locale}/sitemap-categories.xml`,
      lastmod: new Date().toISOString(),
    });
  } else {
    for (let i = 0; i < categoriesChunks; i++) {
      sitemapEntries.push({
        loc: `${BASE_URL}/${locale}/categories/sitemap-categories-${i}.xml`,
        lastmod: new Date().toISOString(),
      });
    }
  }

  // Companies sitemaps
  if (companiesChunks === 1) {
    sitemapEntries.push({
      loc: `${BASE_URL}/${locale}/sitemap-companies.xml`,
      lastmod: new Date().toISOString(),
    });
  } else {
    for (let i = 0; i < companiesChunks; i++) {
      sitemapEntries.push({
        loc: `${BASE_URL}/${locale}/companies/sitemap-companies-${i}.xml`,
        lastmod: new Date().toISOString(),
      });
    }
  }

  // Blogs sitemaps
  if (blogsChunks === 1) {
    sitemapEntries.push({
      loc: `${BASE_URL}/${locale}/sitemap-blogs.xml`,
      lastmod: new Date().toISOString(),
    });
  } else {
    for (let i = 0; i < blogsChunks; i++) {
      sitemapEntries.push({
        loc: `${BASE_URL}/${locale}/blogs/sitemap-blogs-${i}.xml`,
        lastmod: new Date().toISOString(),
      });
    }
  }

  // Products sitemaps
  if (productsChunks === 1) {
    sitemapEntries.push({
      loc: `${BASE_URL}/${locale}/products/sitemap.xml`,
      lastmod: new Date().toISOString(),
    });
  } else {
    for (let i = 0; i < productsChunks; i++) {
      sitemapEntries.push({
        loc: `${BASE_URL}/${locale}/products/sitemap${i}.xml`,
        lastmod: new Date().toISOString(),
      });
    }
  }

  // Generate sitemap index XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (entry) => `  <sitemap>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
