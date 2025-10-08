"use client";

import clientAxios from "@/libs/axios/clientAxios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

export function useGetFollowings(userId) {
  const lang = useLocale().split("-")[1];

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user", "user-followings", lang, userId],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await clientAxios.get("/client/followers", {
        params: {
          page: pageParam,
          profile_id: userId,
          type: "following",
        },
      });
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch followers");
      }
    },

    getNextPageParam: (lastPage, pages) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },

    retry: false,
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
