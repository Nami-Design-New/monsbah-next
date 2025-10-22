import serverAxios from "@/libs/axios/severAxios";

const DEFAULT_PAGE_SIZE = 10000;

/**
 * Fetch a single page of products optimised for sitemap generation.
 * Wraps the /client/productsForSiteMap endpoint and normalises the response shape.
 */
export default async function getProductsForSitemap({
  country_slug,
  lang,
  page = 1,
  length = DEFAULT_PAGE_SIZE,
} = {}) {
  if (!country_slug) {
    throw new Error("country_slug is required to fetch products for sitemap");
  }

  try {
    const response = await serverAxios.get("/client/productsForSiteMap", {
      params: {
        page,
        country_slug,
        length,
        lang,
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
      "[getProductsForSitemap] Failed:",
      error?.message || "Unknown error"
    );
    throw error;
  }
}
