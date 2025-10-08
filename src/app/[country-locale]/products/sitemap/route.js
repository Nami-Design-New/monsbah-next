import { NextResponse } from "next/server";
import getProducts from "@/services/products/getProducts";
import { BASE_URL } from "@/utils/constants";

// Google’s hard limits
// Google limits
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024; // 50 MB (uncompressed)

// API returns ~50 products per page. Update this if API page size changes
const PRODUCTS_PER_API_PAGE = 50;
// Number of API pages that fill one sitemap chunk at most
const PAGES_PER_CHUNK = Math.ceil(MAX_URLS_PER_SITEMAP / PRODUCTS_PER_API_PAGE);

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id") || "0"); // sitemap chunk index
    const locale = params["country-locale"] || "sa-ar";

    // Extract country and language
    const [country_slug, lang] = locale.split("-");

    // Compute the API page range covered by this sitemap chunk
    const startPage = id * PAGES_PER_CHUNK + 1;
    const endPage = startPage + PAGES_PER_CHUNK - 1;

    const products = [];

    for (let page = startPage; page <= endPage; page++) {
      try {
        const data = await getProducts({
          pageParam: page,
          lang,
          country_slug,
          user: "client",
        });

        const list = data?.data?.data || [];
        if (!list.length) break;

        products.push(...list);

        // Stop if we’ve reached the sitemap limit
        if (products.length >= MAX_URLS_PER_SITEMAP) break;

        // Stop if API has no more pages
        const hasNext = Boolean(data?.data?.links?.next);
        if (!hasNext) break;
      } catch (error) {
        console.error(`Error fetching products page ${page}:`, error);
        break;
      }
    }

    // Build <url> entries
    const urls = [];
    for (const product of products) {
      if (product?.slug && product?.id) {
        // Determine last modification date prioritising product update then newest image update
        let lastmodSource = product?.updated_at;
        if (
          !lastmodSource &&
          Array.isArray(product?.images) &&
          product.images.length
        ) {
          // Pick the most recent updated_at among images
          lastmodSource = product.images.reduce((latest, img) => {
            if (
              img?.updated_at &&
              (!latest || new Date(img.updated_at) > new Date(latest))
            ) {
              return img.updated_at;
            }
            return latest;
          }, null);
        }
        if (!lastmodSource) lastmodSource = product?.created_at;

        const lastmod = new Date(lastmodSource || new Date()).toISOString();

        // Add main product URL
        urls.push(`<url>
  <loc>${BASE_URL}/${locale}/product/${product.slug}-id=${product.id}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>`);

        // Add company product URL only if it's a company product
        if (product?.user?.user_type === "company" && product?.company_name) {
          urls.push(`<url>
  <loc>${BASE_URL}/${locale}/company-product/${product.slug}-id=${product.id}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>`);
        }
      }

      // Stop if file size approaches 50 MB
      const currentSize = Buffer.byteLength(urls.join("\n"), "utf8");
      if (currentSize >= MAX_BYTES_PER_SITEMAP) {
        break;
      }
    }

    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating products sitemap chunk:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
