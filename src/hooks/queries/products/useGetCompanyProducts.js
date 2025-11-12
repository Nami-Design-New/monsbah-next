"use client";
import clientAxios from "@/libs/axios/clientAxios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
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

function useGetCompanyProducts(isMyCompany) {
  const { id } = useParams();
  const { user } = useAuthStore((state) => state);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const lang = locale.split("-")[1];
  const country_slug = locale.split("-")[0];
  const type = searchParams.get("type");
  const sort = searchParams.get("sort");
  const city_id = searchParams.get("city");
  const search = searchParams.get("search");
  const category_slug = searchParams.get("category");
  const sub_category_slug = searchParams.get("sub_category");
  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: [
      "company-products",
      country_slug,
      type,
      sort,
      city_id,
      id,
      category_slug,
      sub_category_slug,
      search,
      lang,
    ],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await clientAxios.get("/company/products", {
        params: {
          type,
          sort,
          city_id,
          country_slug,
          company_id: isMyCompany ? user?.id : id,
          page: pageParam,
          category_slug,
          sub_category_slug,
        },
      });
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch companies");
      }
    },

    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data stays fresh
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - cache time (formerly cacheTime)
  });

  const hasCompletedInitialLoad = useRef(false);

  // Mark once initial load finishes so filters trigger progress
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

  return {
    isLoading,
    data,
    total: data?.pages?.[0]?.total || 0,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  };
}

export default useGetCompanyProducts;
