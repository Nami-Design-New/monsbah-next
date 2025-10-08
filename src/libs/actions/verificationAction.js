"use server";

import serverAxios from "../axios/severAxios";

export async function verificationAction(requestBody) {
  try {
    const response = await serverAxios.post(
      "/client/store-verification",
      requestBody
    );

    if (response.status === 200) {
      revalidatePath("/");
      return response.data;
    }

    return req.data.data;
  } catch (error) {
    console.error("Submit product error:", error);
    throw new Error(
      error?.response?.data?.message || "Verification request failed"
    );
  }
}
