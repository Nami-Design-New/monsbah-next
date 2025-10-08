import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import clientAxios from "../../../libs/axios/clientAxios";
import { useAuthModal } from "@/stores/useAuthModal";

export default function useGetComments() {
  const { id } = useParams();
  const lang = useSelector((state) => state.language.lang);
  const { userType } = useAuthModal((state) => state);
  const { isLoading, data, error } = useQuery({
    queryKey: ["comments", lang, id],

    queryFn: async () => {
      try {
        const res = await clientAxios.get(
          `/${userType}/comments?product_id=${id}`
        );
        if (res.status === 200) {
          return res.data.data || {};
        }
      } catch (error) {
        console.error("Error fetching comments:", error.message);
        throw error;
      }
    },
    enabled: Boolean(id),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return { isLoading, data, error };
}
