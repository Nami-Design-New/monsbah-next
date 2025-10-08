"use client";

import clientAxios from "@/libs/axios/clientAxios";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

function useGetCategories() {
  const lang = useLocale().split("-")[1];

  const { isLoading, data, error } = useQuery({
    queryKey: ["categories", lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get("/client/categories", {
          headers: {
            lang,
          },
        });

        if (res.status === 200) {
          return res.data?.data?.data;
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  return { isLoading, data, error };
}

export default useGetCategories;
