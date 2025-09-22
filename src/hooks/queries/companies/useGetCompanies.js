"use client";
import clientAxios from "@/libs/axios/clientAxios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";

function useGetCompanies() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = useLocale();

  const lang = locale.split("-")[1];
  const country_slug = useLocale().split("-")[0];

  const city_id = searchParams.get("city");
  const category_slug =
    params.category && params.category !== "undefined"
      ? decodeURIComponent(params.category)
      : null;
  const search = searchParams.get("search");
 
  const pageParamFromUrl = Number(searchParams.get("page")) || 1;

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["companies", country_slug, city_id, category_slug, lang, search],

    queryFn: async ({ pageParam = pageParamFromUrl }) => {
      const res = await clientAxios.get("/client/companies", {
        params: {
          page: pageParam,
          city_id,
          country_slug,
          category_slug,
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

    getNextPageParam: (lastPage, pages) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
    retry: false,
  });

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
  };
}

export default useGetCompanies;
