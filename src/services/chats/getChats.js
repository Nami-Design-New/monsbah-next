import serverAxios from "@/libs/axios/severAxios";

export async function getChats(pageParam = 1) {
  try {
    const res = await serverAxios.get("/client/chat", {
      params: {
        page: pageParam,
      },
    });
    if (res.status === 200) {
      return res?.data?.data?.data;
    }
  } catch (error) {
    console.log(error);

    throw new Error("Failed to fetch chats");
  }
}
