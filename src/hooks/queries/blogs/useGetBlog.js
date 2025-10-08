import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import clientAxios from "../../../libs/axios/clientAxios";
import { useParams } from "react-router-dom";

export default function useGetBlog() {
  const { id } = useParams();
  const lang = useSelector((state) => state.language.lang);

  const { isLoading, data, error } = useQuery({
    queryKey: ["blog", lang, id],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(`client/blog?blog_id=${id}`);
        if (res.status === 200) {
          return res.data.data || {};
        }
      } catch (error) {
        console.error("Error fetching blog:", error.message);
        throw error;
      }
    },
    retry: false,
    enabled: !!id,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  return { isLoading, data, error };
}
