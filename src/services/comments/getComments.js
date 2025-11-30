import serverAxios from "@/libs/axios/severAxios";
import { getUserType } from "../auth/getUserType";

export async function getComments(id) {
  const userType = await getUserType();
  const res = await serverAxios.get(`/${userType}/comments?product_id=${id}`);
  if (res.status === 200) {
    return res.data.data || {};
  }
  return {};
}
