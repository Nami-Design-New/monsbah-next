import FilterSection from "@/components/home/FilterSection";
import HeroSection from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import { CategoryTabProvider } from "@/components/home/CategoryTabContext";
import CompaniesList from "@/components/search/CompaniesList";
import { getCompanies } from "@/services/ads/getCompanies";
import { getUserType } from "@/services/auth/getUserType";
import { getCategories } from "@/services/categories/getCategories";
import getProducts from "@/services/products/getProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import React from "react";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getSettings } from "@/services/settings/getSettings";
import { META_DATA_CONTENT } from "@/utils/constants";
import { resolveCanonicalUrl } from "@/utils/canonical";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryDecoded =
    category && category !== "undefined" ? decodeURIComponent(category) : null;
  const pathname = categoryDecoded ? `/${categoryDecoded}` : "/";
  const user = await getUserType();
  const categories = await getCategories(`/${user}/categories`);
  const categoryData = categories?.find((item) => item.slug === categoryDecoded) || {};
  const locale = await getLocale();
  const lang = locale.split("-")[1];
  const content = META_DATA_CONTENT[lang] ?? META_DATA_CONTENT.ar;
  const settings = await getSettings();
  const siteTitle = settings?.meta_title || settings?.name || content.title;
  const siteName = settings?.name || content.title;
  
  // Use category-specific metadata if available, otherwise fallback to site defaults
  const title = categoryData?.meta_title || 
                (categoryData?.name ? `${categoryData.name} - ${siteTitle}` : siteTitle);
  const description = categoryData?.meta_description || 
                      settings?.meta_description || 
                      content.description;
  
  const alternates = await generateHreflangAlternates(pathname);
  const canonicalUrl = resolveCanonicalUrl(
    categoryData?.canonical_url,
    categoryData?.canonicalUrl,
    categoryData?.canonical
  );
  if (canonicalUrl) {
    alternates.canonical = canonicalUrl;
  }
  
  return {
    title: {
      absolute: title,
    },
    description,
    applicationName: siteName,
    openGraph: {
      title,
      siteName,
      description,
    },
    alternates,
    robots: {
      index: categoryData?.is_index ?? true,
      follow: categoryData?.is_follow ?? true,
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
  const user = await getUserType();
  const locale = await getLocale();

  // Create a QueryClient for server-side
  const queryClient = getQueryClient();
  const selectedCategory = categoryDecoded;
  const [country_slug, lang] = locale.split("-");

  // Get category data for H1 title and description
  let categoryData = null;
  try {
    const categories = await getCategories(`/${user}/categories`);
    if (categories && Array.isArray(categories)) {
      categoryData = categories.find((item) => item.slug === categoryDecoded);
      
      // If category is provided but not found, show 404
      if (categoryDecoded && !categoryData) {
        console.warn(`Category not found: ${categoryDecoded}`);
        notFound();
      }
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    // Only throw 404 if it's a genuine not found error
    if (error?.message?.includes('404') || error?.status === 404) {
      notFound();
    }
    // For other errors, continue without category data (graceful degradation)
  }
  
  const settings = await getSettings();
  
  // Use meta_title for H1, fallback to name
  const h1Title = categoryData?.meta_title || 
                  categoryData?.name || 
                  settings?.name;
  
  // Get description for display
  const pageDescription = categoryData?.meta_description;

  // Extract all search parameters
  const type = paramsObj?.type || null;
  const sort = paramsObj?.sort || null;
  const city_id = paramsObj?.city || null;
  const category_slug = categoryDecoded || null;
  const sub_category_slug = subCategoryDecoded || null;
  const search = paramsObj?.search || null;
  const pageParamUrl = Number(paramsObj?.page) || 1;

  // render check
  const hasCategory = Boolean(
    categoryDecoded &&
      categoryDecoded !== "undefined" &&
      categoryDecoded !== "null"
  );
  const hasSubcategory = Boolean(
    subCategoryDecoded &&
      subCategoryDecoded !== "undefined" &&
      subCategoryDecoded !== "null"
  );
  const showCompanies = !hasSubcategory && hasCategory && user === "company";

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
    initialPageParam: pageParamUrl,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
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
    <CategoryTabProvider>
      <HeroSection h1Title={h1Title} />
      
      {/* Display category description if available */}
      {/* {pageDescription && (
        <div className="container mb-3 mt-3">
          <p className="text-muted text-center">{pageDescription}</p>
        </div>
      )} */}
      
      <FilterSection selectedCategory={selectedCategory} selectedSubCategory={null} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        {showCompanies ? (
          <CompaniesList />
        ) : (
          <ProductsSection userType={user} />
        )}
      </HydrationBoundary>
    </CategoryTabProvider>
  );
}
