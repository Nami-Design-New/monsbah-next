import FilterSection from "@/components/home/FilterSection";
import HeroSection from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import { CategoryTabProvider } from "@/components/home/CategoryTabContext";
import { getUserType } from "@/services/auth/getUserType";
import getProducts from "@/services/products/getProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getSubCategories } from "@/services/categories/getSubCategories";
import { getCategories } from "@/services/categories/getCategories";
import { getSettings } from "@/services/settings/getSettings";
import { META_DATA_CONTENT } from "@/utils/constants";
import { resolveCanonicalUrl } from "@/utils/canonical";
import { notFound } from "next/navigation";

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
  
  const locale = await getLocale();
  const lang = locale.split("-")[1];
  const content = META_DATA_CONTENT[lang] ?? META_DATA_CONTENT.ar;
  const settings = await getSettings();
  const siteTitle = settings?.meta_title || settings?.name || content.title;
  const siteName = settings?.name || content.title;
  
  // Use subcategory-specific metadata if available, otherwise fallback to site defaults
  const title = subCategoryData?.meta_title || 
                (subCategoryData?.name ? `${subCategoryData.name} - ${siteTitle}` : siteTitle);
  const description = subCategoryData?.meta_description || 
                      settings?.meta_description || 
                      content.description;
  
  const alternates = await generateHreflangAlternates(pathname);
  const canonicalUrl = resolveCanonicalUrl(
    subCategoryData?.canonical_url,
    subCategoryData?.canonicalUrl,
    subCategoryData?.canonical
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
      index: subCategoryData?.is_index ?? true,
      follow: subCategoryData?.is_follow ?? true,
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

  // Validate category exists
  if (categoryDecoded) {
    try {
      const categories = await getCategories();
      if (categories && Array.isArray(categories)) {
        const categoryExists = categories.some(cat => cat.slug === categoryDecoded);
        if (!categoryExists) {
          console.warn(`Category not found: ${categoryDecoded}`);
          notFound();
        }
      }
    } catch (error) {
      console.error("Error validating category:", error);
      // Only throw 404 if it's a genuine not found error, not a network/API error
      if (error?.message?.includes('404') || error?.status === 404) {
        notFound();
      }
      // For other errors, let the page load anyway (graceful degradation)
    }
  }

  // Get subcategory data for H1 title and description
  let subCategoryData = null;
  if (categoryDecoded) {
    try {
      const subCategories = await getSubCategories(
        { category_slug: categoryDecoded },
        `/${user}/sub-categories`
      );
      if (subCategories && Array.isArray(subCategories)) {
        subCategoryData = subCategories.find((item) => item.slug === subCategoryDecoded);
        
        // If subcategory is provided but not found, show 404
        if (subCategoryDecoded && !subCategoryData) {
          console.warn(`Subcategory not found: ${subCategoryDecoded} in category: ${categoryDecoded}`);
          notFound();
        }
      }
    } catch (error) {
      console.error("Error fetching subcategory:", error);
      // Only throw 404 if it's a genuine not found error
      if (error?.message?.includes('404') || error?.status === 404) {
        notFound();
      }
      // For other errors, continue without subcategory data (graceful degradation)
    }
  }
  const settings = await getSettings();
  
  // Use meta_title for H1, fallback to name
  const h1Title = subCategoryData?.meta_title || 
                  subCategoryData?.name || 
                  settings?.name;
  
  // Get description for display
  const pageDescription = subCategoryData?.meta_description;

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
    <CategoryTabProvider>
      <HeroSection h1Title={h1Title} />
      
      {/* Display subcategory description if available */}
      {pageDescription && (
        <div className="container mb-3 mt-3">
          <p className="text-muted text-center">{pageDescription}</p>
        </div>
      )}
      
      <FilterSection selectedCategory={selectedCategory} selectedSubCategory={subCategoryDecoded} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsSection userType={user} />
      </HydrationBoundary>
    </CategoryTabProvider>
  );
}
