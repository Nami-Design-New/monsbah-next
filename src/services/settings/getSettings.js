import serverAxios from "@/libs/axios/severAxios";

export async function getSettings() {
  try {
    const res = await serverAxios.get("/client/setting");
    return res?.data?.data || null;
  } catch {
    return null;
  }
}

