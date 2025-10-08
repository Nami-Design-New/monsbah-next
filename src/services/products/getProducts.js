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
}) {
  try {
    const res = await serverAxios.get(`/${user}/products`, {
      params: {
        page: pageParam,
        country_slug,
        type,
        sort,
        city_id,
        category_slug,
        sub_category_slug,
        search,
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch products");
  }
}
