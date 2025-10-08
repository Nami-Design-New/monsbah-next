import serverAxios from "@/libs/axios/severAxios";
import { getUserType } from "../auth/getUserType";
import { error } from "console";

export async function getFavorites(pageParam = 1) {
  const userType = await getUserType();

  const endPoint = `/${userType}/favorites`;
  try {
    const res = await serverAxios.get(endPoint, {
      params: {
        page: pageParam,
      },
    });
    if (res.status === 200) {
      return res?.data;
    }
  } catch (erros) {
    console.log(error);

    throw new Error("Failed to fetch favs");
  }
}
