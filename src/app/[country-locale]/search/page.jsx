import AdsProductList from "@/components/search/AdsProductList";
import { getAds } from "@/services/ads/getAds";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses searchParams
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const t = await getTranslations("meta");
  const query = (await searchParams)?.search;

  const pathname = query
    ? `/search?search=${encodeURIComponent(query)}`
    : "/search";
  const alternates = await generateHreflangAlternates(pathname);

  return {
    title: query
      ? `${t("searchResults.title")} "${query}"`
      : t("popularAds.title"),
    description: query
      ? `${t("searchResults.description")} "${query}"`
      : t("popularAds.description"),
    alternates,
  };
}

export default async function page({ searchParams }) {
  const search = (await searchParams)?.search;
  const t = await getTranslations();
  const lang = (await getLocale()).split("-")[1];
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["ads", lang, search],
    queryFn: ({ pageParam = 1 }) => getAds(search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <>
      <div className="row">
        <div className="col-12 p-2">
          <h6 className="title">{t("popularAds")}</h6>
          <p className="desc">{t("popularAdsDesc")}</p>
        </div>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdsProductList />
      </HydrationBoundary>
    </>
  );
}
