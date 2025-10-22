import serverAxios from "@/libs/axios/severAxios";

/**
 * Fetch paginated products for a public user profile.
 *
 * @param {number|string} userId - The ID of the user whose products should be returned.
 * @param {number} pageParam - The page number to request (1-based).
 * @returns {Promise<Object>} API response containing product data.
 */
export async function getAllProducts(userId, pageParam = 1) {
  if (!userId) {
    throw new Error("userId is required to fetch products");
  }

  const response = await serverAxios.get("/client/products", {
    params: {
      page: pageParam,
      user_id: userId,
    },
  });

  if (response.status === 200) {
    return response.data;
  }

  throw new Error("Failed to fetch products");
}
