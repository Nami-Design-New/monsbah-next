import { useQuery } from "@tanstack/react-query";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetAllRates({ id, enabled }) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["allRates"],
    queryFn: async () => {
      const res = await clientAxios.get("/client/rates", {
        params: {
          profile_id: id,
        },
      });
      if (res.status === 200) {
        return {
          data: res.data,
        };
      } else {
        throw new Error("Failed to fetch products");
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: Boolean(enabled),
  });

  return { isLoading, data, error };
}

export default useGetAllRates;
