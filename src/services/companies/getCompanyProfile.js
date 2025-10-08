import serverAxios from "@/libs/axios/severAxios";

export async function getCompanyProfile(company_id) {
  try {
    const res = await serverAxios.get("/client/company_profile", {
      params: {
        company_id,
      },
    });
    if (res.status === 200) {
      return res?.data?.data || {};
    }
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    throw error;
  }
}
