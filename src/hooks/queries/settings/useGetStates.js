import clientAxios from "@/libs/axios/clientAxios";
import { useQuery } from "@tanstack/react-query";

function useGetStates(cityId, enabled) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["states", cityId],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(`/client/states?city_id=${cityId}`);
        if (res.status === 200) {
          return res.data?.data;
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    enabled,
  });

  return { isLoading, data, error };
}

export default useGetStates;
