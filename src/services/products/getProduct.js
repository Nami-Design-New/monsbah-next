import serverAxios from "@/libs/axios/severAxios";

export async function getProduct(slug, country_slug) {
  
  try {
    const res = await serverAxios.get(`/client/product-details/${slug}`,{
      params:{
        country_slug
      }
    });
    if (res?.status === 200) {
      return res?.data?.data;
    }
  } catch (error) {
    console.log(error);
    
    console.error("Error fetching product:", error.message);
    throw error;
  }
}
