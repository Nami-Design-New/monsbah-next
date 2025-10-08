import serverAxios from "@/libs/axios/severAxios";
import { getUserType } from "../auth/getUserType";

export async function getUserProfile(profile_id) {
  // const userType = await getUserType();
  try {
    const res = await serverAxios.get(`/client/UserProfile`, {
      params: {
        profile_id,
      },
    });
    console.log(res);

    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    console.error("Error fetching profile:", error.response);
    console.error("Error fetching profile:", error.message);
    throw error;
  }
}
