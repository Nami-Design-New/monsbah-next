import serverAxios from "@/libs/axios/severAxios";

export async function getCategories(endPoint = "/client/categories") {
  try {
    const res = await serverAxios.get(endPoint);
    if (res?.status === 200) {
      return res.data.data.data;
    }
  } catch (error) {
    console.log("Error fetching categories", error);

    throw error;
  }
}
