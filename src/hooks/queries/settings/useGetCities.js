import clientAxios from "@/libs/axios/clientAxios";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

function useGetCities(countryId, enabled) {
  const lang = useLocale().split("-")[1] || "en";

  const { isLoading, data, error } = useQuery({
    queryKey: ["cities", countryId, lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(
          `/client/cities?country_id=${countryId}`
        );
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

export default useGetCities;
