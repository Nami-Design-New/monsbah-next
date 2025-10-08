import { useQuery } from "@tanstack/react-query";
import clientAxios from "../../../libs/axios/clientAxios";

export default function useGetAuthedUser(enabled) {
  const { isLoading, data, error, refetch, isFetched } = useQuery({
    queryKey: ["authed-user"],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(
          `/${localStorage.getItem("user_type")}/auth/profile`
        );
        if (res.status === 200) {
          return res.data.data || {};
        }
      } catch (error) {
        console.error("Error fetching profile:", error.message);
        throw error;
      }
    },
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return { isLoading, data, error, refetch, isFetched };
}
