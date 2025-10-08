import FilterSection from "@/components/home/FilterSection";
import HeroSection from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import { getUserType } from "@/services/auth/getUserType";
import getProducts from "@/services/products/getProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getSubCategories } from "@/services/categories/getSubCategories";

export async function generateMetadata({ params }) {
  const { category, subcategory } = await params;
  const user = await getUserType();
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
        `/${user}/sub-categories`
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
    alternates,
    robots: {
      index: subCategoryData.is_index,
      follow: subCategoryData.is_follow,
    },
  };
}

export default async function page({ params, searchParams }) {
  const { category, subcategory } = await params;
  const categoryDecoded =
    category && category !== "undefined" ? decodeURIComponent(category) : null;
  const subCategoryDecoded =
    subcategory && subcategory !== "undefined"
      ? decodeURIComponent(subcategory)
      : null;

  const paramsObj = await searchParams;
  const pageParamFromUrl = Number(paramsObj?.page) || 1;
  const user = await getUserType();
  const locale = await getLocale();

  // Create a QueryClient for server-side
  const queryClient = getQueryClient();
  const selectedCategory = categoryDecoded;
  const [country_slug, lang] = locale.split("-");

  // Extract all search parameters
  const sort = paramsObj?.type || null;
  const type = paramsObj?.type || null;
  const city_id = paramsObj?.city || null;
  const category_slug = categoryDecoded || null;
  const sub_category_slug = subCategoryDecoded || null;
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
    queryFn: ({ pageParam = 1 }) =>
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
    initialPageParam: pageParamFromUrl,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  return (
    <>
      <HeroSection />
      <FilterSection selectedCategory={selectedCategory} selectedSubCategory={subCategoryDecoded} />{" "}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsSection userType={user} />
      </HydrationBoundary>
    </>
  );
}
