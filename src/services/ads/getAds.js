import serverAxios from "@/libs/axios/severAxios";
import { getUserType } from "../auth/getUserType";

export async function getAds(search, pageParam = 1) {
  const userType = await getUserType();
  try {
    const res = await serverAxios.get(`/${userType}/products`, {
      params: {
        page: pageParam,
        search: search,
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    throw new Error("Failed to fetch ads");
  }
}
