import getProductsForSitemap from "@/services/products/getProductsForSitemap";

const DEFAULT_PAGE_SIZE = 10000;
const DEFAULT_MAX_PAGES = 300;
const DEFAULT_CONCURRENCY = 10;

function getLocaleLabel(locale, country_slug) {
  if (locale) return locale;
  if (country_slug) return country_slug;
  return "unknown-locale";
}

/**
 * Fetches all products for a given locale/country combination, handling pagination
 * with concurrency and optional hard limits.
 *
 * @param {Object} params
 * @param {string} params.locale - The full locale (e.g., "kw-ar")
 * @param {string} params.country_slug - Country identifier used by the API
 * @param {string} params.lang - Language identifier used by the API
 * @param {number} [params.pageSize=10000] - Page size for each API request
 * @param {number} [params.maxPages=300] - Maximum number of pages to fetch
 * @param {number} [params.concurrency=10] - Maximum number of concurrent requests
 * @returns {Promise<Array>} Resolves with an array containing all products
 */
export default async function fetchAllProductsForSitemap({
  locale,
  country_slug,
  lang,
  pageSize = DEFAULT_PAGE_SIZE,
  maxPages = DEFAULT_MAX_PAGES,
  concurrency = DEFAULT_CONCURRENCY,
} = {}) {
  if (!country_slug) {
    throw new Error("country_slug is required to fetch products for sitemap");
  }

  const localeLabel = getLocaleLabel(locale, country_slug);
  const allProducts = [];
  let pagesFetched = 0;

  const initialResponse = await getProductsForSitemap({
    page: 1,
    lang,
    country_slug,
    length: pageSize,
  });

  const firstPageProducts = initialResponse.items ?? [];
  const meta = initialResponse.meta ?? {};
  const links = initialResponse.links ?? {};

  allProducts.push(...firstPageProducts);
  pagesFetched += 1;

  const perPage = meta.per_page || meta.perPage || pageSize;
  const total = meta.total || meta.Total || (firstPageProducts.length || 0);
  const reportedLastPage = meta.last_page || meta.lastPage || null;
  const hasNext = Boolean(links?.next);

  const derivedLastPage =
    reportedLastPage ||
    (total && perPage ? Math.ceil(total / perPage) : null);

  if (derivedLastPage && derivedLastPage > 1) {
    const pagesQueue = [];
    for (
      let page = 2;
      page <= Math.min(derivedLastPage, maxPages);
      page += 1
    ) {
      pagesQueue.push(page);
    }

    const resolvedConcurrency = Math.min(concurrency, pagesQueue.length || 0);

    await Promise.all(
      Array.from({ length: resolvedConcurrency || 0 }, async () => {
        while (pagesQueue.length) {
          const nextPage = pagesQueue.shift();
          if (nextPage === undefined) break;
          try {
            const response = await getProductsForSitemap({
              page: nextPage,
              lang,
              country_slug,
              length: pageSize,
            });
            const items = response.items ?? [];
            allProducts.push(...items);
            pagesFetched += 1;
          } catch (error) {
            console.error(
              `[Products] Failed to fetch page ${nextPage} for ${localeLabel}:`,
              error.message
            );
          }
        }
      })
    );
  } else if (!derivedLastPage && hasNext) {
    let nextPage = 2;
    let continueFetching = hasNext;

    while (continueFetching && nextPage <= maxPages) {
      try {
        const response = await getProductsForSitemap({
          page: nextPage,
          lang,
          country_slug,
          length: pageSize,
        });
        const items = response.items ?? [];
        const nextLinks = response.links ?? {};
        allProducts.push(...items);
        continueFetching = Boolean(nextLinks?.next);
        nextPage += 1;
        pagesFetched += 1;
      } catch (error) {
        console.error(
          `[Products] Failed to fetch page ${nextPage} for ${localeLabel}:`,
          error.message
        );
        break;
      }
    }
  }

  console.log(
    `[Products] ${localeLabel}: fetched ${allProducts.length} products across ${pagesFetched} pages`
  );

  return allProducts;
}
