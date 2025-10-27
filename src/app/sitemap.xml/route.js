import { LOCALES } from "@/i18n/routing";
import { BASE_URL } from "@/utils/constants";
import { getCategories } from "@/services/categories/getCategories";
import getProducts from "@/services/products/getProducts";
import { calculateChunks, generateChunkedSitemapEntries } from "@/utils/sitemap-utils";
import { getGlobalImageEntries, chunkImageEntries } from "@/utils/imageSitemap";

export const dynamic = "force-dynamic";

/**
 * Fast product chunk calculation - only fetches first page to get total count
 */
async function getProductsChunkCount(locale) {
  try {
    const [country_slug, lang] = locale.split("-");
    const response = await getProducts({
      pageParam: 1,
      lang,
      country_slug,
      user: "client",
    });

    // Extract total from API response metadata
    const total =
      response?.data?.meta?.total ||
      response?.meta?.total ||
      response?.data?.total ||
      response?.total ||
      0;

    console.log(`[Products] ${locale}: ${total} total products`);
    return total > 0 ? calculateChunks(total) : 1;
  } catch (error) {
    console.error(`[Products] Error getting count for ${locale}:`, error);
    return 1;
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const filterLocale = url.searchParams.get("locale");

    const sitemapPaths = [];
    const currentDate = new Date().toISOString();

    // --- Global image/video sitemaps (skip when filtering by locale)
    if (!filterLocale) {
      try {
        const imageEntries = await getGlobalImageEntries();
        const imageChunks = chunkImageEntries(imageEntries);

        if (imageChunks.length === 0) {
          // No global media entries available; skip adding paths
        } else if (imageChunks.length === 1) {
          sitemapPaths.push({
            loc: `${BASE_URL}/sitemap-images.xml`,
            lastmod: currentDate,
          });
        } else {
          imageChunks.forEach((_, index) => {
            sitemapPaths.push({
              loc: `${BASE_URL}/sitemap-image${index}.xml`,
              lastmod: currentDate,
            });
          });
        }
      } catch (error) {
        console.error("❌ Error preparing global image sitemap entries:", error);
      }
    }

    // delete this block if you want to enable news sitemap
    // sitemapPaths.push({
    //   loc: `${BASE_URL}/sitemap-news.xml`,
    //   lastmod: currentDate,
    // });

    // --- Loop through all locales
    for (const locale of LOCALES) {
      if (filterLocale && locale !== filterLocale) {
        continue;
      }
      const [country_slug] = locale.split("-");

      // 1️⃣ Static pages
      sitemapPaths.push({
        loc: `${BASE_URL}/${locale}/sitemap-static.xml`,
        lastmod: currentDate,
      });

      // 2️⃣ Categories sitemap (no cache)
      try {
        const endpoint = `/client/categories?country_slug=${country_slug}`;
        const categories = await getCategories(endpoint);
        const categoryCount = Array.isArray(categories) ? categories.length : 0;
        const categoryChunks = calculateChunks(categoryCount);

        if (categoryChunks <= 1) {
          sitemapPaths.push({
            loc: `${BASE_URL}/${locale}/sitemap-categories.xml`,
            lastmod: currentDate,
          });
        } else {
          sitemapPaths.push(
            ...generateChunkedSitemapEntries(locale, "categories", categoryChunks, currentDate)
          );
        }
      } catch (error) {
        console.error(`❌ Error fetching categories for ${locale}:`, error);
      }

      // 3️⃣ Products sitemap - FAST: only fetch first page to get total
      try {
        const productChunks = await getProductsChunkCount(locale);
        
        for (let i = 0; i < Math.max(productChunks, 1); i++) {
          sitemapPaths.push({
            loc: `${BASE_URL}/${locale}/sitemap-products${i}.xml`,
            lastmod: currentDate,
          });
        }
      } catch (error) {
        console.error(`❌ Error calculating products chunks for ${locale}:`, error);
      }

      // 4️⃣ Companies + Blogs
      sitemapPaths.push(
        { loc: `${BASE_URL}/${locale}/sitemap-companies.xml`, lastmod: currentDate },
        { loc: `${BASE_URL}/${locale}/sitemap-blogs.xml`, lastmod: currentDate }
      );
    }

    // --- XML OUTPUT
    let filteredPaths = sitemapPaths;
    if (filterLocale) {
      const localeFragment = `/${filterLocale}/`;
      filteredPaths = sitemapPaths.filter((entry) => entry.loc.includes(localeFragment));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${filteredPaths
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("🚨 Error generating sitemap index:", error);
    return new Response("Error generating sitemap index", { status: 500 });
  }
}
