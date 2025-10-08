import CompanyFavoritesList from "@/components/companies/CompanyFavoritesList";
import { getUserType } from "@/services/auth/getUserType";
import { getFavorites } from "@/services/favorites/getFavorites";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";

export default async function page() {
  const queryClient = getQueryClient();
  const locale = await getLocale();
  const lang = locale.split("-")[1];

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["company-favorites", lang],
    queryFn: ({ pageParam = 1 }) => getFavorites(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CompanyFavoritesList />
    </HydrationBoundary>
  );
}
