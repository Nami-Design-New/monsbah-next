import serverAxios from "@/libs/axios/severAxios";
import { cookies } from "next/headers";
import { getUserType } from "../auth/getUserType";

export default async function getNotifications(pageParam = 1) {
  try {
    const userType = await getUserType();
    const cookiesStore = await cookies();
    const tokenCookie = cookiesStore.get("token");
    
    // Return empty data if no token
    if (!tokenCookie?.value) {
      return { data: { data: [] } };
    }
    
    const token = tokenCookie.value;
    const endPoint = `/${userType}/notifications`;

    const res = await serverAxios.get(endPoint, {
      params: {
        page: pageParam,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      return res.data;
    }
    
    return { data: { data: [] } };
  } catch (error) {
    // Return empty data instead of throwing
    console.error("Error fetching notifications:", error.message);
    return { data: { data: [] } };
  }
}
