import serverAxios from "@/libs/axios/severAxios";
import { cookies } from "next/headers";

export async function refreshToken() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;
  try {
    const res = await serverAxios.post("/client/auth/refresh-token", {
      token,
    });
    const data = res?.data;
    const newToken = data?.data?.token;

    return newToken;
  } catch (e) {
    console.log("error Refresh Token", e);
  }
}
