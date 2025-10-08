"use client";

import clientAxios from "@/libs/axios/clientAxios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";

function useGetProducts(userType) {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = useLocale().split("-")[1];
  const country_slug = useLocale().split("-")[0];
  const type = searchParams.get("type") || null;
  const pageParamFromUrl = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort");
  const city_id = searchParams.get("city");

  const category_slug =
    params.category && params.category !== "undefined"
      ? decodeURIComponent(params.category)
      : undefined;

  const sub_category_slug =
    params.subcategory && params.subcategory !== "undefined"
      ? decodeURIComponent(params.subcategory)
      : undefined;
  const search = searchParams.get("search");

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    initialPageParam: pageParamFromUrl,
    queryKey: [
      "products",
      lang,
      country_slug,
      type,
      sort,
      city_id,
      category_slug,
      sub_category_slug,
      search,
      userType,
    ],

    queryFn: async ({ pageParam = pageParamFromUrl }) => {
      const res = await clientAxios.get(`/${userType}/products`, {
        params: {
          page: pageParam,
          country_slug,
          type,
          sort,
          city_id,
          category_slug,
          sub_category_slug,
          search,
        },
      });
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch products");
      }
    },

    getNextPageParam: (lastPage, pages) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
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
    error,
    total,
    perPage,
    currentPage: Number(currentPageMeta),
    lastPage: Number(lastPageMeta),
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

export default useGetProducts;
