import serverAxios from "@/libs/axios/severAxios";

export async function getAllProducts(id, pageParam = 1) {
  const res = await serverAxios.get("/client/products", {
    params: {
      page: pageParam,
      user_id: id,
    },
  });
  if (res.status === 200) {
    return res?.data;
  } else {
    throw new Error("Failed to fetch products");
  }
}
