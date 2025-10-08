import serverAxios from "@/libs/axios/severAxios";
import { getAuthedUser } from "../auth/getAuthedUser";

export async function getCompanyProducts({
  id,
  type,
  sort,
  city_id,
  category_slug,
  sub_category_slug,
  country_id,
  isMyCompany,
  // search,
  pageParam = 1,
} = {}) {
  let user;
  if (isMyCompany) {
    user = await getAuthedUser();
  }
  try {
    const res = await serverAxios.get("/company/products", {
      params: {
        type,
        sort,
        city_id,
        // search,
        country_id,
        category_slug,
        company_id: isMyCompany ? user?.id : id,
        sub_category_slug,
        page: pageParam,
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
