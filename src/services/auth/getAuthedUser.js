import serverAxios from "@/libs/axios/severAxios";
import { getUserType } from "./getUserType";

export async function getAuthedUser() {
  const userType = await getUserType();

  const endPoint = `/${userType}/auth/profile`;
  try {
    const res = await serverAxios.get(endPoint);
    if (res.status === 200) {
      return res.data.data || {};
    }
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    throw error;
  }
}
