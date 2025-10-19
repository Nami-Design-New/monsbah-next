import ProductList from "@/components/companies/ProductList";
import FilterCompanySection from "@/components/home/FilterCompanySection";
import { getCompanyProducts } from "@/services/companies/getCompanyProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getSubCategories } from "@/services/categories/getSubCategories";

export async function generateMetadata({ params }) {
  const t = await getTranslations("meta");
  const { category, subcategory } = await params;
  const categoryDecoded =
    category && category !== "undefined" ? decodeURIComponent(category) : null;
  const subCategoryDecoded =
    subcategory && subcategory !== "undefined"
      ? decodeURIComponent(subcategory)
      : null;
  let pathname = "/";
  if (categoryDecoded && subCategoryDecoded) {
    pathname = `/${categoryDecoded}/${subCategoryDecoded}`;
  } else if (categoryDecoded) {
    pathname = `/${categoryDecoded}`;
  }
  
  let subCategoryData = { is_index: true, is_follow: true };
  
  if (categoryDecoded) {
    try {
      const subCategories = await getSubCategories(
        {
          category_slug: categoryDecoded,
        },
        `/company/sub-categories`
      );
      const found = subCategories?.find(
        (item) => item.slug === subCategoryDecoded
      );
      if (found) {
        subCategoryData = found;
      }
    } catch {
      // Use default values if subcategory fetch fails
    }
  }
  
  const alternates = await generateHreflangAlternates(pathname);

  return {
    title: `${t("companies.titleByCategorySub")} ${category} - ${subcategory}`,
    description: `${t(
      "companies.descriptionByCategorySub"
    )} ${category}, ${subcategory}`,
    alternates,
    robots: {
      index: subCategoryData.is_index,
      follow: subCategoryData.is_follow,
    },
  };
}

export default async function Companies({ searchParams, params }) {
  const locale = await getLocale();
  const paramsObj = await searchParams;
  const { id, category, subcategory } = await params;

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
  const type = paramsObj?.type || null;
  const sort = paramsObj?.sort || null;
  const city_id = paramsObj?.city || null;
  const search = paramsObj?.search || null;
  const category_slug = categoryDecoded || null;
  const sub_category_slug = subCategoryDecoded || null;

  await queryClient.prefetchInfiniteQuery({
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
    queryFn: ({ pageParam = 1 }) =>
      getCompanyProducts({
        pageParam,
        lang,
        country_slug,
        type,
        sort,
        city_id,
        category_slug,
        sub_category_slug,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <div className="pt-4 pb-4">
      <FilterCompanySection selectedCategory={selectedCategory} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductList />
      </HydrationBoundary>
    </div>
  );
}
