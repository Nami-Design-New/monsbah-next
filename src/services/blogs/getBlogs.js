import serverAxios from "@/libs/axios/severAxios";

export async function getBlogs() {
  try {
    const res = await serverAxios.get("/client/blogs");
    const data = res?.data?.data?.data;

    return data;
  } catch (error) {
    console.error("Fetching blogs failed:", error);
    throw error;
  }
}
