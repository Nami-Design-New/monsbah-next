import serverAxios from "@/libs/axios/severAxios";
import { cookies } from "next/headers";

export const getUserProducts = async (pageParam = 1) => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token").value;
  try {
    const res = await serverAxios.get("/client/user-products", {
      params: { page: pageParam },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      return res?.data;
    }
  } catch (erros) {
    throw new Error("Failed to fetch products");
  }
};
