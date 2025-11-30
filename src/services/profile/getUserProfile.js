import serverAxios from "@/libs/axios/severAxios";

export async function getUserProfile(profile_id) {
  try {
    const res = await serverAxios.get(`/client/UserProfile`, {
      params: {
        profile_id,
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    console.error("Error fetching profile:", error.response);
    console.error("Error fetching profile:", error.message);
    throw error;
  }
}
