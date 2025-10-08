import serverAxios from "@/libs/axios/severAxios";
import { cookies } from "next/headers";
import { getUserType } from "../auth/getUserType";

export default async function getNotifications(pageParam = 1) {
  const userType = await getUserType();
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token").value;
  const endPoint = `/${userType}/notifications`;

  try {
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
  } catch (error) {
    throw new Error("Failed to fetch notifications");
  }
}
