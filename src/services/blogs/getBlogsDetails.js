import serverAxios from "@/libs/axios/severAxios";

export async function getBlogsDetails(id) {
  try {
    const res = await serverAxios.get(`client/blog?blog_slug=${id}`);
    if (res.status === 200) {
      return res.data.data || {};
    }
  } catch (error) {
    console.error("Error fetching blog:", error.message);
    throw error;
  }
}
