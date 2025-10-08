import serverAxios from "@/libs/axios/severAxios";

export async function getCompaniesCategories() {
  try {
    const res = await serverAxios.get("/company/categories");
    if (res.status === 200) {
      return res.data?.data?.data;
    }
  } catch (error) {
    throw new Error(error);
  }
}
