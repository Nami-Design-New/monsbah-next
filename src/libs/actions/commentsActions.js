"use server";

import { getUserType } from "@/services/auth/getUserType";
import serverAxios from "../axios/severAxios";
import { revalidatePath } from "next/cache";

//!------------------- Add COmment actoin --------!

export async function AddCommentsAction(data) {
  const userType = await getUserType();

  try {
    const res = await serverAxios.post(`/${userType}/store-comment`, data);
    if (res?.status === 200) {
      revalidatePath("/product");
      return {
        success: true,
        data: res.data,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Something went wrong",
    };
  }
}

// ! ---------------- delete Comment Action ---------------!

export async function deleteCommentAction(data, type) {
  const userType = await getUserType();
  const endpoint =
    type === "question"
      ? `/${userType}/delete-question-comment`
      : `/${userType}/delete-comment`;
  try {
    const res = await serverAxios.post(endpoint, data);

    if (res?.status === 200) {
      revalidatePath("/product");
      return {
        success: true,
        data: res.data,
      };
    }
  } catch (error) {
    console.error("Delete comment error:", error?.response?.data?.message);
    return {
      success: false,
      message: error?.response?.data?.message || "Something went wrong",
    };
  }
}
