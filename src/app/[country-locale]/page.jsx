import FilterSection from "@/components/home/FilterSection";
import HeroSection from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import { getUserType } from "@/services/auth/getUserType";
import { getCountries } from "@/services/getCountries";
import getProducts from "@/services/products/getProducts";
import { BASE_URL, LOCALES } from "@/utils/constants";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

export async function generateMetadata() {
  const alternates = await generateHreflangAlternates("/");
  return {
    other: {
      "google-site-verification": "kOD-M71HEym30Cx4W8U0FqAJXpQy8f5TgdYkxqNXeAk",
    },
    alternates,
  };
}

export default async function Home({ searchParams }) {
  const paramsObj = await searchParams;
  const pageParamUrl = Number(paramsObj?.page) || 1;
  const user = await getUserType();
  const locale = await getLocale();

  // Create a QueryClient for server-side
  const queryClient = getQueryClient();

  const [country_slug, lang] = locale.split("-");

  // Extract all search parameters
  const type = paramsObj?.type || null;
  const sort = paramsObj?.sort || null;
  const city_id = paramsObj?.city || null;
  const category_slug = paramsObj?.category || null;
  const sub_category_slug = paramsObj?.sub_category || null;
  const search = paramsObj?.search || null;

  await queryClient.prefetchInfiniteQuery({
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
      user,
    ],
    queryFn: ({ pageParam = pageParamUrl }) =>
      getProducts({
        pageParam,
        lang,
        country_slug,
        type,
        sort,
        city_id,
        category_slug,
        sub_category_slug,
        search,
        user,
      }),
    initialPageParam: pageParamUrl,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <>
      <HeroSection />
      <FilterSection selectedCategory={null} selectedSubCategory={null} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsSection userType={user} />
      </HydrationBoundary>
    </>
  );
}
