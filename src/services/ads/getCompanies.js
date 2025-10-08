import serverAxios from "@/libs/axios/severAxios";

export async function getCompanies({
  pageParam = 1,
  city_id,
  country_slug,
  category_slug,
  search,
}) {
  try {
    const res = await serverAxios.get("/client/companies", {
      params: {
        page: pageParam,
        search,
        country_slug,
        city_id,
        category_slug,
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch companies");
  }
}
