"use client";
import clientAxios from "@/libs/axios/clientAxios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import NProgress from "nprogress";

// Configure NProgress to match NextTopLoader settings
if (typeof window !== 'undefined') {
  NProgress.configure({ 
    showSpinner: false,
    minimum: 0.08,
    easing: 'ease',
    speed: 300,
    trickleSpeed: 200
  });
}

function useGetCompanies() {
  const searchParams = useSearchParams();
  const locale = useLocale();

  const lang = locale.split("-")[1];
  const country_slug = useLocale().split("-")[0];

  const city_id = searchParams.get("city");
  const category_slug = searchParams.get("category");
  const sub_category_slug = searchParams.get("sub_category");
  const search = searchParams.get("search");
 
  const pageParamFromUrl = Number(searchParams.get("page")) || 1;

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["companies", country_slug, city_id, category_slug, sub_category_slug, lang, search],

    queryFn: async ({ pageParam = pageParamFromUrl }) => {
      const res = await clientAxios.get("/client/companies", {
        params: {
          page: pageParam,
          city_id,
          country_slug,
          category_slug,
          sub_category_slug,
          search,
        },
      });
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch companies");
      }
    },

    initialPageParam: pageParamFromUrl,

    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data stays fresh
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - cache time (formerly cacheTime)
  });

  const hasCompletedInitialLoad = useRef(false);

  // Remember once the very first load finishes so future filters show progress
  useEffect(() => {
    if (!hasCompletedInitialLoad.current && !isLoading && !isFetching) {
      hasCompletedInitialLoad.current = true;
    }
  }, [isLoading, isFetching]);

  // Trigger loading bar when fetching (skip initial load and pagination)
  useEffect(() => {
    const shouldShowProgress =
      isFetching && !isFetchingNextPage && hasCompletedInitialLoad.current;

    if (shouldShowProgress) {
      NProgress.start();
    } else if (!isFetching) {
      NProgress.done();
    }

    return () => {
      NProgress.done();
    };
  }, [isFetching, isFetchingNextPage]);

  const firstPage = data?.pages?.[0];
  const meta = firstPage?.data?.meta || firstPage?.meta || {};
  const perPage = meta.per_page || firstPage?.per_page || 50;
  const currentPageMeta = meta.current_page || meta.page || 1;
  const total = meta.total || firstPage?.total || 0;
  const lastPageMeta = meta.last_page || Math.ceil(total / perPage) || 1;

  return {
    isLoading,
    data,
    total,
    perPage,
    currentPage: Number(currentPageMeta),
    lastPage: Number(lastPageMeta),
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  };
}

export default useGetCompanies;
