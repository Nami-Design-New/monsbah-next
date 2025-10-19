import CompaniesSection from "@/components/companies/CompaniesSection";
import Pagination from "@/components/shared/Pagination";
import FilterCompanySection from "@/components/home/FilterCompanySection";
import { getCompanies } from "@/services/ads/getCompanies";
import { getUserType } from "@/services/auth/getUserType";
import { getCategories } from "@/services/categories/getCategories";
import getProducts from "@/services/products/getProducts";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryDecoded =
    category && category !== "undefined" ? decodeURIComponent(category) : null;
  const pathname = categoryDecoded
    ? `/companies/${categoryDecoded}`
    : `/companies`;
  const categories = await getCategories(`/company/categories`);
  const categoryData = categories.find((item) => item.slug === categoryDecoded);

  const alternates = await generateHreflangAlternates(pathname);
  return {
    alternates,
    robots: { index: categoryData.is_index, follow: categoryData.is_follow },
  };
}

export default async function page({ params, searchParams }) {
  const locale = await getLocale();
  const user = await getUserType();
  const { category, subcategory } = await params;
  const paramsObj = await searchParams;

  const categoryDecoded =
    category && category !== "undefined" ? decodeURIComponent(category) : null;
  const subCategoryDecoded =
    subcategory && subcategory !== "undefined"
      ? decodeURIComponent(subcategory)
      : null;

  // Create a QueryClient for server-side
  const queryClient = getQueryClient();
  const selectedCategory = categoryDecoded;
  const [country_slug, lang] = locale.split("-");

  // Extract all search parameters
  const type = paramsObj.type || null;
  const sort = paramsObj?.sort || null;
  const city_id = paramsObj?.city || null;
  const category_slug = categoryDecoded || null;
  const sub_category_slug = subCategoryDecoded || null;
  const search = paramsObj?.search || null;
  const pageParamUrl = Number(paramsObj?.page) || 1;

  // Prefetch products with ALL parameters including search
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  // Fetch first page of companies to get meta for fallback pagination
  const firstPageData = await getCompanies({
    pageParam: pageParamUrl,
    city_id,
    country_slug,
    category_slug,
    lang,
    search,
  });

  // Prefetch companies
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["companies", country_slug, city_id, category_slug, lang, search],
    queryFn: ({ pageParam = 1 }) =>
      getCompanies({
        pageParam,
        city_id,
        country_slug,
        category_slug,
        lang,
        search,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <>
      <div className="pt-4 pb-4">
        <FilterCompanySection selectedCategory={selectedCategory} />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <CompaniesSection />
        </HydrationBoundary>

        {/* Fallback pagination for no-JS environments */}
        <Pagination currentPage={pageParamUrl} totalPages={firstPageData?.meta?.last_page || 1} />
      </div>
    </>
  );
}
