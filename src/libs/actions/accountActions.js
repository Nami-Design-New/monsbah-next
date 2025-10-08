"use server";
import { cookies } from "next/headers";
import serverAxios from "../axios/severAxios";

export async function deleteAccountAction() {
  const cookieStore = await cookies();
  try {
    const res = await serverAxios.post("/client/auth/delete-account");

    if (res?.status === 200) {
      cookieStore.delete("token");
      cookieStore.delete("user_type");
      delete serverAxios.defaults.headers.common["Authorization"];

      return {
        success: true,
        data: res.data,
      };
    } else {
      return {
        success: false,
        message: res.data || "Account deletion failed",
      };
    }
  } catch (error) {
    const message = error?.response?.data?.message || "Error during logout:";
    return {
      success: false,
      message: message || "Something went wrong",
    };
  }
}
