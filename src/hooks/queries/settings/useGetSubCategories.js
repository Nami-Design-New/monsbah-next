import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetSubCategories(category, enabled, page) {
  const lang = useLocale().split("-")[1];

  const { isLoading, data, error } = useQuery({
    queryKey: ["sub-categories", category, lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(
          `${
            page === "companies" ? "company" : localStorage.getItem("user_type")
          }/sub-categories${category ? `?category_id=${category}` : ""}`
        );
        if (res.status === 200) {
          return res.data?.data?.data;
        }
      } catch (error) {
        console.log(error);

        throw new Error(error);
      }
    },
    enabled: enabled,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { isLoading, data, error };
}

export default useGetSubCategories;
