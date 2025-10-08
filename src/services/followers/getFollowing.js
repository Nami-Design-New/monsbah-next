import serverAxios from "@/libs/axios/severAxios";

export async function getFollowing(profile_id, pageParam = 1) {
  try {
    const res = await serverAxios.get("/client/followers", {
      params: {
        page: pageParam,
        profile_id,
        type: "following",
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    throw new Error("Failed to fetch persons");
  }
}
