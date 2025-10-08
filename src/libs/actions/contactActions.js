"use server";
import serverAxios from "../axios/severAxios";

export async function contactAction(data) {
  try {
    const res = await serverAxios.post("/client/store-contact", data);
    return {
      success: true,
      data: res?.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
}
