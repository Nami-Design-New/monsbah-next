"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetChats() {
  const lang = useLocale().split("-")[0];

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["chats", lang],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await clientAxios.get("/client/chat", {
        params: {
          page: pageParam,
        },
      });
      if (res.status === 200) {
        return {
          data: res.data?.data?.data,
          total: res.data?.data?.meta?.total,
          per_page: res.data?.data?.meta?.per_page,
        };
      } else {
        throw new Error("Failed to fetch chats");
      }
    },

    getNextPageParam: (lastPage, pages) => {
      const isMore = lastPage.data.length >= lastPage.per_page;
      return isMore ? pages.length + 1 : undefined;
    },
  });

  return {
    isLoading,
    data: data?.pages.flatMap((page) => page.data) || [],
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

export default useGetChats;
