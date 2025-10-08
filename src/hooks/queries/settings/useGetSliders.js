import clientAxios from "@/libs/axios/clientAxios";
import { useQuery } from "@tanstack/react-query";

function useGetSliders() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const res = await clientAxios.get("/client/sliders");
      if (res.status === 200) {
        return {
          data: res.data,
        };
      } else {
        throw new Error("Failed to fetch sliders");
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { isLoading, data, error };
}

export default useGetSliders;
