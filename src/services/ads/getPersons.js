import serverAxios from "@/libs/axios/severAxios";

export async function getPersons(search, pageParam = 1) {
  try {
    const res = await serverAxios.get("/client/search-profiles", {
      params: {
        page: pageParam,
        search: search,
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    throw new Error("Failed to fetch persons");
  }
}
