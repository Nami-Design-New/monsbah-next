import serverAxios from "@/libs/axios/severAxios";

export async function getSubCategories(
  params,
  endPoint = "/client/sub-categories"
) {
  const res = await serverAxios.get(endPoint, {
    params,
  });

  const data = res?.data?.data?.data;

  return data;
}
