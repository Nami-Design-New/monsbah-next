import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetCompanyProfile(enabled) {
  const { id } = useParams();

  const { isLoading, data, error, refetch, isFetched } = useQuery({
    queryKey: ["company-profile", id],
    queryFn: async () => {
      try {
        const res = await clientAxios.get("/client/company_profile", {
          params: {
            company_id: +id,
          },
        });
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

export default useGetCompanyProfile;
