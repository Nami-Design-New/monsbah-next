import serverAxios from "@/libs/axios/severAxios";

export async function getSettings() {
  try {
    const res = await serverAxios.get("/client/setting");
    const data = res?.data?.data || null;
    return res?.data?.data || null;

  } catch (error) {
    console.error("Failed to fetch settings", error);
    return null;
  }
}

