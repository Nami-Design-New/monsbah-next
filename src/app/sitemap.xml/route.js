import { LOCALES } from "@/i18n/routing";
import getProducts from "@/services/products/getProducts";
import { BASE_URL } from "@/utils/constants";

const CHUNK_SIZE = 50000;

export const dynamic = "force-dynamic";

async function getChunkCountForLocale(locale) {
  try {
    const [country_slug, lang] = locale.split("-");

    const data = await getProducts({
      pageParam: 1,
      lang,
      country_slug,
      user: "client",
    });

    const firstPageLength = data?.data?.data?.length || 0;

    const perPageCandidates = [
      data?.per_page,
      data?.data?.per_page,
      data?.meta?.per_page,
      data?.data?.meta?.per_page,
      firstPageLength || undefined,
    ].filter(Boolean);
    const perPage = perPageCandidates[0] || 50;

    const totalCandidates = [
      data?.total,
      data?.data?.total,
      data?.meta?.total,
      data?.data?.meta?.total,
    ].filter((v) => typeof v === "number");

    let total = totalCandidates[0];

    if (typeof total !== "number") {
      // Try to derive last_page from various shapes (Laravel-style paginator)
      const lastPageCandidates = [
        data?.meta?.last_page,
        data?.data?.meta?.last_page,
        (() => {
          try {
            const last = data?.links?.last || data?.data?.links?.last;
            if (last) return Number(new URL(last).searchParams.get("page"));
          } catch (_) {}
          return undefined;
        })(),
      ].filter((v) => typeof v === "number" && !Number.isNaN(v));

      if (lastPageCandidates[0]) {
        total = lastPageCandidates[0] * perPage;
      }
    }

    if (typeof total === "number" && total > 0) {
      return Math.max(1, Math.ceil(total / CHUNK_SIZE));
    }

    if (firstPageLength > 0) {
      // If we only know first page length, assume at least one chunk
      return Math.max(1, Math.ceil(firstPageLength / CHUNK_SIZE));
    }

    // Fallback to 10 chunks if total cannot be determined
    return 10;
  } catch (e) {
    console.error("Error estimating product chunks for", locale, e);
    return 10;
  }
}

export async function GET() {
  try {
    // Build sitemap list per-locale.
    const sitemapPaths = [];
    const currentDate = new Date().toISOString();

    // Compute chunk counts for all locales in parallel for efficiency
    const chunkCounts = await Promise.all(
      LOCALES.map((locale) => getChunkCountForLocale(locale))
    );

    LOCALES.forEach((locale, idx) => {
      // Static sitemap per-locale (highest priority)
      sitemapPaths.push({
        loc: `${BASE_URL}/${locale}/sitemap-static.xml`,
        lastmod: currentDate,
      });
      
      // Categories sitemap per-locale (high priority)
      sitemapPaths.push({
        loc: `${BASE_URL}/${locale}/sitemap-categories.xml`,
        lastmod: currentDate,
      });
      
      // Companies sitemap per-locale (good priority)
      sitemapPaths.push({
        loc: `${BASE_URL}/${locale}/sitemap-companies.xml`,
        lastmod: currentDate,
      });
      
      // Blogs sitemap per-locale (content priority)
      sitemapPaths.push({
        loc: `${BASE_URL}/${locale}/sitemap-blogs.xml`,
        lastmod: currentDate,
      });

      // Products sitemaps (dynamic chunk count)
      const chunks = chunkCounts[idx] || 10;
      for (let id = 0; id < chunks; id++) {
        sitemapPaths.push({
          loc: `${BASE_URL}/${locale}/products/sitemap${id}.xml`,
          lastmod: currentDate,
        });
      }
    });

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
