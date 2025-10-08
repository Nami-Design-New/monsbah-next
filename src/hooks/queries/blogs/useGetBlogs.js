import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import clientAxios from "../../../libs/axios/clientAxios";

export default function useGetBlogs() {
  const lang = useSelector((state) => state.language.lang);

  const { isLoading, data, error } = useQuery({
    queryKey: ["blogs", lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(`/client/blogs`);
        if (res.status === 200) {
          return res.data.data || {};
        }
      } catch (error) {
        console.error("Error fetching blogs:", error.message);
        throw error;
      }
    },
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  return { isLoading, data, error };
}
