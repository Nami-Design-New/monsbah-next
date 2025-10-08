"use client";
import clientAxios from "@/libs/axios/clientAxios";
import { useAuthModal } from "@/stores/useAuthModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

function useGetAds() {
  const lang = useLocale().split("-")[1];
  const { userType } = useAuthModal((state) => state);
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
    queryKey: ["ads", lang, search],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await clientAxios.get(`/${userType}/products`, {
        params: {
          page: pageParam,
          search: search,
        },
      });
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch ads");
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
    total: data?.pages?.[0]?.total || 0,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

export default useGetAds;
