import getProductImagesForSitemap from "@/services/products/getProductImagesForSitemap";

const DEFAULT_PAGE_SIZE = 5000;
const DEFAULT_MAX_PAGES = 500;

/**
 * Fetches all product media entries across pagination for sitemap generation.
 */
export default async function fetchAllProductImagesForSitemap({
  pageSize = DEFAULT_PAGE_SIZE,
  maxPages = DEFAULT_MAX_PAGES,
} = {}) {
  const allItems = [];
  let currentPage = 1;
  let lastPage = null;

  while (currentPage <= maxPages) {
    if (lastPage !== null && currentPage > lastPage) {
      break;
    }

    try {
      const { items, meta } = await getProductImagesForSitemap({
        page: currentPage,
        length: pageSize,
      });

      if (!items.length) {
        break;
      }

      allItems.push(...items);

      if (meta?.last_page) {
        lastPage = Number(meta.last_page) || currentPage;
      }
    } catch (error) {
      console.error(
        `[fetchAllProductImagesForSitemap] Failed on page ${currentPage}:`,
        error?.message
      );
      break;
    }

    currentPage += 1;
  }

  return allItems;
}
