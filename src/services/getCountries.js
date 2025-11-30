import serverAxios from "@/libs/axios/severAxios";

export async function getCountries() {
  const res = await serverAxios.get("/client/countries");
  const data = res?.data?.data;
  return data;
}
