import serverAxios from "@/libs/axios/severAxios";

const DEFAULT_PAGE_SIZE = 5000;

/**
 * Fetch a single page of product media (images/videos) optimised for sitemap usage.
 */
export default async function getProductImagesForSitemap({
  page = 1,
  length = DEFAULT_PAGE_SIZE,
} = {}) {
  try {
    const response = await serverAxios.get("/client/products-images", {
      params: {
        page,
        length,
      },
      timeout: 15000,
    });

    if (response.status !== 200) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = response.data?.data ?? {};
    const items = Array.isArray(payload?.data) ? payload.data : [];
    const meta = payload?.meta ?? {};
    const links = payload?.links ?? {};

    return {
      items,
      meta,
      links,
    };
  } catch (error) {
    console.error(
      "[getProductImagesForSitemap] Failed:",
      error?.message || "Unknown error"
    );
    throw error;
  }
}
