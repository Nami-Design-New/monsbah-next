"use server";

import { revalidatePath } from "next/cache";
import serverAxios from "../axios/severAxios";

export async function toggleFavorite(productId, userType) {
  try {
    const res = await serverAxios.post(`/${userType}/store-favorite`, {
      product_id: productId,
    });
    if (res.status === 200) {
      revalidatePath("/profile/favorites");
      revalidatePath("/product");

      return {
        success: true,
        data: res.data,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
}
