import CompaniesAds from "@/components/companies/CompaniesAds";
import { getCompanyProducts } from "@/services/companies/getCompanyProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses searchParams
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const t = await getTranslations("meta");
  const {
    search,
    country_id,
    city_id,
    category_id,
    type,
    sort,
    sub_category_id,
  } = searchParams || {};

  const hasFilters =
    search || category_id || sub_category_id || country_id || city_id;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (country_id) params.set("country_id", country_id);
  if (city_id) params.set("city_id", city_id);
  if (category_id) params.set("category_id", category_id);
  if (type) params.set("type", type);
  if (sort) params.set("sort", sort);
  if (sub_category_id) params.set("sub_category_id", sub_category_id);
  const q = params.toString();
  const pathname = q ? `/search/companies-ads?${q}` : "/search/companies-ads";
  const alternates = await generateHreflangAlternates(pathname);

  return {
    title: hasFilters
      ? `${t("companyAds.searchTitle")} "${search || ""}"`
      : t("companyAds.title"),
    description: hasFilters
      ? `${t("companyAds.searchDescription")} "${search || ""}"`
      : t("companyAds.description"),
    alternates,
  };
}

export default async function page({ searchParams }) {
  const storeSearchparams = await searchParams;
  const lang = (await getLocale()).split("-")[1];

  const {
    search: _search,
    country_id,
    city_id,
    category_id,
    type,
    sort,
    sub_category_id,
  } = storeSearchparams;

  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: [
      "company-products",
      country_id,
      type,
      sort,
      city_id,
      // id,
      category_id,
      sub_category_id,
      lang,
    ],
    queryFn: ({ pageParam = 1 }) =>
      getCompanyProducts({
        pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CompaniesAds />
    </HydrationBoundary>
  );
}
