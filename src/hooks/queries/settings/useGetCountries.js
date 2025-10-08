import clientAxios from "@/libs/axios/clientAxios";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

function useGetCountries() {
  const lang = useLocale().split("-")[1] || "en";

  const { isLoading, data, error } = useQuery({
    queryKey: ["countries", lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get("/client/countries", {
          headers: {
            lang,
          },
        });

        if (res.status === 200) {
          return res.data?.data;
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  return { isLoading, data, error };
}

export default useGetCountries;
