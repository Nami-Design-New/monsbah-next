import { BASE_URL } from "@/utils/constants";
import getProductsForSitemap from "@/services/products/getProductsForSitemap";
import getAllCompanies from "@/services/companies/getAllCompanies";
import {
  generateCachedChunkedSitemap,
  generateCachedChunkedImageSitemap,
  createSitemapResponse,
} from "@/utils/sitemap-utils";
import { LOCALES } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const PRODUCTS_PAGE_SIZE = 10000;
const MAX_PRODUCTS_PAGES = 300;
const PRODUCT_PAGE_CONCURRENCY = 10;

async function fetchAllProductsForSitemap({ locale, country_slug, lang }) {
  const allProducts = [];
  let pagesFetched = 0;

  const initialResponse = await getProductsForSitemap({
    page: 1,
    lang,
    country_slug,
    length: PRODUCTS_PAGE_SIZE,
  });

  const firstPageProducts = initialResponse.items ?? [];
  const meta = initialResponse.meta ?? {};
  const links = initialResponse.links ?? {};

  allProducts.push(...firstPageProducts);
  pagesFetched += 1;

  const perPage = meta.per_page || meta.perPage || PRODUCTS_PAGE_SIZE;
  const total = meta.total || meta.Total || (firstPageProducts.length || 0);
  const reportedLastPage = meta.last_page || meta.lastPage || null;
  const hasNext = Boolean(links?.next);

  const derivedLastPage =
    reportedLastPage ||
    (total && perPage ? Math.ceil(total / perPage) : null);

  if (derivedLastPage && derivedLastPage > 1) {
    const pagesQueue = [];
    for (let page = 2; page <= Math.min(derivedLastPage, MAX_PRODUCTS_PAGES); page += 1) {
      pagesQueue.push(page);
    }

    const concurrency = Math.min(PRODUCT_PAGE_CONCURRENCY, pagesQueue.length);

    await Promise.all(
      Array.from({ length: concurrency || 0 }, async () => {
        while (pagesQueue.length) {
          const nextPage = pagesQueue.shift();
          if (nextPage === undefined) break;
          try {
            const response = await getProductsForSitemap({
              page: nextPage,
              lang,
              country_slug,
              length: PRODUCTS_PAGE_SIZE,
            });
            const items = response.items ?? [];
            allProducts.push(...items);
            pagesFetched += 1;
          } catch (error) {
            console.error(
              `[Products] Failed to fetch page ${nextPage} for ${locale}:`,
              error.message
            );
          }
        }
      })
    );
  } else if (!derivedLastPage && hasNext) {
    let nextPage = 2;
    let continueFetching = hasNext;

    while (continueFetching && nextPage <= MAX_PRODUCTS_PAGES) {
      try {
        const response = await getProductsForSitemap({
          page: nextPage,
          lang,
          country_slug,
          length: PRODUCTS_PAGE_SIZE,
        });
        const items = response.items ?? [];
        const nextLinks = response.links ?? {};
        allProducts.push(...items);
        continueFetching = Boolean(nextLinks?.next);
        nextPage += 1;
        pagesFetched += 1;
      } catch (error) {
        console.error(
          `[Products] Failed to fetch page ${nextPage} for ${locale}:`,
          error.message
        );
        break;
      }
    }
  }

  console.log(
    `[Products] ${locale}: fetched ${allProducts.length} products across ${pagesFetched} pages`
  );

  return allProducts;
}

/**
 * Dynamic route for chunked sitemaps
 * Handles: /sa-ar/sitemap-products0.xml, /sa-ar/sitemap-companies0.xml, etc.
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const locale = resolvedParams["country-locale"];
    if (!LOCALES.includes(locale)) {
      console.log(
        `[Sitemap Dynamic] Unsupported locale requested: ${locale}, returning 404`
      );
      return new Response("Locale not supported", { status: 404 });
    }
    const rawFilename = Array.isArray(resolvedParams["filename"])
      ? resolvedParams["filename"].join("")
      : resolvedParams["filename"] || "";
    let normalized = rawFilename.trim();

    console.log(`[Sitemap Dynamic] Raw filename param:`, rawFilename);
    console.log(`[Sitemap Dynamic] Filename type:`, typeof rawFilename);

    // Ensure locale cookie is set for downstream API calls
    const { cookies: setCookie } = await import("next/headers");
    const cookieStore = await setCookie();
    cookieStore.set("NEXT_LOCALE", locale);

    if (!normalized) {
      console.log(`[Sitemap Dynamic] Empty filename - returning 404 to allow other routes`);
      return new Response(null, { status: 404 });
    }

    if (normalized.endsWith(".xml")) {
      normalized = normalized.slice(0, -4);
    }
    if (normalized.startsWith("sitemap-")) {
      normalized = normalized.slice("sitemap-".length);
    }

    console.log(`[Sitemap Dynamic] Normalized filename:`, normalized);

    // If this is actually the locale sitemap index (sitemap.xml), delegate to dedicated route
    if (normalized === "sitemap") {
      console.log(`[Sitemap Dynamic] Delegating to locale sitemap index handler`);
      const { GET: localeSitemapHandler } = await import("../../sitemap.xml/route");
      return localeSitemapHandler(request, { params: Promise.resolve(resolvedParams) });
    }

    // Delegate to specific sitemap routes when available (e.g., sitemap-static.xml)
    const directHandlers = new Map([
      ["static", () => import("../../sitemap-static.xml/route")],
      ["categories", () => import("../../sitemap-categories.xml/route")],
      ["blogs", () => import("../../sitemap-blogs.xml/route")],
      ["companies", () => import("../../sitemap-companies.xml/route")],
    ]);
    if (directHandlers.has(normalized)) {
      console.log(`[Sitemap Dynamic] Delegating to dedicated ${normalized} sitemap`);
      const moduleLoader = directHandlers.get(normalized);
      try {
        const { GET: directHandler } = await moduleLoader();
        return directHandler(request, { params: Promise.resolve(resolvedParams) });
      } catch (handlerError) {
        console.error(`[Sitemap Dynamic] Failed delegating to ${normalized} sitemap:`, handlerError);
        return new Response("Error generating sitemap", { status: 500 });
      }
    }
    
    // Extract type and chunk number (e.g., "products0" -> type="products", chunk=0)
    const match = normalized.match(/^(products|companies)(\d+)$/);
    if (!match) {
      console.log(`[Sitemap Dynamic] No match for normalized filename: ${normalized}`);
      return new Response(null, { status: 404 });
    }
    
    const [, type, chunkStr] = match;
    const chunkIndex = parseInt(chunkStr, 10);
    const [country_slug, lang] = locale.split("-");
    
    console.log(`[Sitemap ${type}] Generating chunk ${chunkIndex} for ${locale}`);
    
    // Handle based on type
    if (type === "products") {
      return await handleProductsSitemap(locale, country_slug, lang, chunkIndex);
    } else if (type === "companies") {
      return await handleCompaniesSitemap(locale, country_slug, lang, chunkIndex);
    }
    
    return new Response("Unknown sitemap type", { status: 400 });
  } catch (error) {
    console.error("Error generating sitemap chunk:", error);
    return new Response(`Error generating sitemap: ${error.message}`, { status: 500 });
  }
}

async function handleProductsSitemap(locale, country_slug, lang, chunkIndex) {
  const cacheKey = `sitemap-products-${locale}`;

  const xml = await generateCachedChunkedSitemap({
    cacheKey,
    fetchDataFn: async () => {
      console.log(`[Products] Fetching all products for ${locale}...`);
      return fetchAllProductsForSitemap({ locale, country_slug, lang });
    },
    transformToUrlsFn: (products) => {
      return (Array.isArray(products) ? products : []).map((product) => {
        const encodedSlug = encodeURIComponent(product.slug || product.id);
        const productUrl = `${BASE_URL}/${locale}/product/${encodedSlug}${
          product.id ? `-id=${product.id}` : ""
        }`;

        return {
          url: productUrl,
          lastModified: new Date(
            product.updated_at || product.created_at || Date.now()
          ).toISOString(),
          changeFrequency: "daily",
          priority: 0.9,
        };
      });
    },
    chunkIndex,
  });

  return createSitemapResponse(xml);
}

async function handleCompaniesSitemap(locale, country_slug, lang, chunkIndex) {
  const cacheKey = `sitemap-companies-${locale}`;

  const xml = await generateCachedChunkedSitemap({
    cacheKey,
    fetchDataFn: async () => {
      console.log(`[Companies] Fetching all companies for ${country_slug}...`);
      try {
        const companies = await getAllCompanies({ country_slug, lang });
        console.log(`[Companies] Fetched ${companies.length} companies`);
        return companies;
      } catch (error) {
        console.error(`[Companies] Error fetching companies:`, error);
        return [];
      }
    },
    transformToUrlsFn: (companies) => {
      return (Array.isArray(companies) ? companies : []).map((company) => ({
        url: `${BASE_URL}/${locale}/company-details/${company.slug || company.id}`,
        lastModified: new Date(company.updated_at || company.created_at || Date.now()).toISOString(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));
    },
    chunkIndex,
  });

  return createSitemapResponse(xml);
}
