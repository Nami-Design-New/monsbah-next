import serverAxios from "@/libs/axios/severAxios";

/**
 * Get products by category slug
 * Used for home page category sections
 */
export async function getProductsByCategory({
  category_slug,
  lang = "ar",
  country_slug = "sa",
  limit = 10,
  user = "client"
}) {
  try {
    const res = await serverAxios.get(`/${user}/products`, {
      params: {
        category_slug,
        lang,
        country_slug,
        per_page: limit,
        page: 1
      }
    });

    if (res.status === 200) {
      return res.data?.data?.data || [];
    }

    return [];
  } catch {
    console.log(`Error fetching products for category: ${category_slug}`);
    return [];
  }
}

/**
 * Get multiple categories with their products
 * Optimized for home page
 */
export async function getCategoriesWithProducts({
  categories = [],
  lang = "ar",
  country_slug = "sa",
  limit = 10,
  user = "client"
}) {
  try {
    const results = await Promise.all(
      categories.map(async (category) => {
        const products = await getProductsByCategory({
          category_slug: category.slug,
          lang,
          country_slug,
          limit,
          user
        });

        return {
          ...category,
          products
        };
      })
    );

    return results.filter(cat => cat.products?.length > 0);
  } catch {
    console.log("Error fetching categories with products");
    return [];
  }
}
