import { useQuery } from "@tanstack/react-query";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetAllAsks(id, enabled) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["allQuestions"],
    queryFn: async () => {
      const res = await clientAxios.get("/client/questions", {
        params: {
          user_id: id,
        },
      });
      if (res.status === 200) {
        return {
          data: res.data,
        };
      } else {
        throw new Error("Failed to fetch questions");
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: Boolean(enabled?.isActive),
  });

  return { isLoading, data, error };
}

export default useGetAllAsks;
