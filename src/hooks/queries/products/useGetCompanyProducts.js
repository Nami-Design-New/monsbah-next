"use client";
import clientAxios from "@/libs/axios/clientAxios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";

function useGetCompanyProducts(isMyCompany) {
  const { id, category, subcategory } = useParams();
  const { user } = useAuthStore((state) => state);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const lang = locale.split("-")[1];
  const country_slug = locale.split("-")[0];
  const type = searchParams.get("type");
  const sort = searchParams.get("sort");
  const city_id = searchParams.get("city");
  const search = searchParams.get("search");

  const category_slug =
    category && category !== "undefined"
      ? decodeURIComponent(category)
      : undefined;

  const sub_category_slug =
    subcategory && subcategory !== "undefined"
      ? decodeURIComponent(subcategory)
      : undefined;
  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
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

    getNextPageParam: (lastPage, pages) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
    retry: false,
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

export default useGetCompanyProducts;
