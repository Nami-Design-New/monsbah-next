import serverAxios from "@/libs/axios/severAxios";

export default async function getProducts({
  pageParam = 1,
  lang,
  country_slug,
  type,
  sort,
  city_id,
  category_slug,
  sub_category_slug,
  search,
  user,
  per_page,
}) {
  try {
    // Validate required parameters
    if (!user || !country_slug) {
      console.error("Missing required parameters:", { user, country_slug });
      return { data: { data: [] } };
    }

    // Validate and clean parameters
    const cleanParams = {
      page: pageParam,
      country_slug,
      lang,
    };

    // Only add optional parameters if they have valid values
    if (type) cleanParams.type = type;
    if (sort) cleanParams.sort = sort;
    if (city_id) cleanParams.city_id = city_id;
    if (category_slug) cleanParams.category_slug = category_slug;
    if (sub_category_slug) cleanParams.sub_category_slug = sub_category_slug;
    if (search) cleanParams.search = search;
    if (per_page) cleanParams.per_page = per_page;

    console.log("Fetching products with params:", {
      endpoint: `/${user}/products`,
      params: cleanParams,
    });

    const res = await serverAxios.get(`/${user}/products`, {
      params: cleanParams,
    });
    
    if (res.status === 200) {
      return res.data;
    }
    
    return { data: { data: [] } };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error("API Response Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        params: error.config?.params,
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    }
    
    // Return empty data instead of throwing to prevent crashes
    return { data: { data: [] } };
  }
}
