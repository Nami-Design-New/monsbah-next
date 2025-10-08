import serverAxios from "@/libs/axios/severAxios";

export async function getSliders() {
  try {
    const res = await serverAxios.get("/client/sliders");
    const data = res?.data?.data?.data;
    return data;
  } catch (error) {
    console.log("Error fetching Silders", error);
    throw error;
  }
}
