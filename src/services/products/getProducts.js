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
      console.error("Missing required parameters: user or country_slug");
      return { data: { data: [] } };
    }

    const res = await serverAxios.get(`/${user}/products`, {
      params: {
        page: pageParam,
        country_slug,
        lang,
        type,
        sort,
        city_id,
        category_slug,
        sub_category_slug,
        search,
        per_page,
      },
    });
    
    if (res.status === 200) {
      return res.data;
    }
    
    return { data: { data: [] } };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    // Return empty data instead of throwing to prevent crashes
    return { data: { data: [] } };
  }
}
