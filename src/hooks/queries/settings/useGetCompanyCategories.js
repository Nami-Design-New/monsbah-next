import clientAxios from "@/libs/axios/clientAxios";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

function useGetCompanyCategories() {
  const lang = useLocale().split("-")[1];

  const { isLoading, data, error } = useQuery({
    queryKey: ["company-categories", lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get("/company/categories");
        if (res.status === 200) {
          return res.data?.data?.data;
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  return { isLoading, data, error };
}

export default useGetCompanyCategories;
