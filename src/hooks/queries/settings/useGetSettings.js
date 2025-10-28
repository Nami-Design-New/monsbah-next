import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetSettings() {
  const locale = useLocale();
  const lang = locale.split("-")[1] || "ar";

  const { isLoading, data, error } = useQuery({
    queryKey: ["settings", lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get("/client/setting");
        if (res.status === 200) {
          return res.data?.data;
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { isLoading, data, error };
}

export default useGetSettings;
