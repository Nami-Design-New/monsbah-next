import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import clientAxios from "../../../libs/axios/clientAxios";

export default function useGetProduct(product_id) {
  const { id } = useParams();
  const lang = useSelector((state) => state.language.lang);

  const { isLoading, data, error } = useQuery({
    queryKey: ["product", lang, product_id || id],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(`/client/product-details`, {
          params: {
            product_id: product_id ? product_id : id,
          },
        });

        if (res.status === 200) {
          return res.data.data || {};
        }
      } catch (error) {
        console.error("Error fetching product:", error.message);
        throw error;
      }
    },
    enabled: Boolean(id) || Boolean(product_id),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return { isLoading, data, error };
}
