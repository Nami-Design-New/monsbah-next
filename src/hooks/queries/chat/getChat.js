import serverAxios from "@/libs/axios/severAxios";
import { getUserType } from "@/services/auth/getUserType";

export async function getChat(userId) {
  const userType = await getUserType();

  try {
    const res = await serverAxios.get(`/client/chat/details`, {
      params: {
        user_id: userId,
        user_type: userType === "client" ? "user" : "company",
      },
    });
    if (res.status === 200) {
      return res.data.data || {};
    }
  } catch (error) {
    console.error("Error fetching chat:", error.message);
    throw error;
  }
}
