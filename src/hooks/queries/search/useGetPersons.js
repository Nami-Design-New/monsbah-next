"use client";

import clientAxios from "@/libs/axios/clientAxios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

function useGetPersons() {
  const lang = useLocale().split("-")[1];
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["persons", lang, search],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await clientAxios.get("/client/search-profiles", {
        params: {
          page: pageParam,
          search: search,
        },
      });
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch profiles");
      }
    },

    getNextPageParam: (lastPage, pages) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return {
    isLoading,
    data,
    error,
    total: data?.pages?.[0]?.total || 0,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

export default useGetPersons;
