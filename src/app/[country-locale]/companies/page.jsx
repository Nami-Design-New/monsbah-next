import ProductList from "@/components/companies/ProductList";
import FilterCompanySection from "@/components/home/FilterCompanySection";
import { getCompanyProducts } from "@/services/companies/getCompanyProducts";
import { getCategories } from "@/services/categories/getCategories";
import { getSubCategories } from "@/services/categories/getSubCategories";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";
import Pagination from "@/components/shared/Pagination";
import { getSeoOverride } from "@/utils/seo-overrides";
import { resolveCanonicalUrl } from "@/utils/canonical";
import { getSettings } from "@/services/settings/getSettings";

// Mark as dynamic - uses searchParams
export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }) {
  const t = await getTranslations("meta");
  const resolvedParams = await params;
  const locale = resolvedParams?.["country-locale"];
  const paramsObj = await searchParams;
  const categorySlug = paramsObj?.category;
  const subCategorySlug = paramsObj?.sub_category;
  const override = getSeoOverride({
    route: "companies",
    locale,
    category: categorySlug,
    subCategory: subCategorySlug,
  });
  
  let canonicalUrl = resolveCanonicalUrl(
    override?.canonical,
    override?.canonical_url,
    override?.canonicalUrl
  );

  // Fetch category and subcategory data for metadata
  let matchedCategory = null;
  let matchedSubCategory = null;

  if (categorySlug) {
    try {
      const categories = await getCategories("/company/categories");
      matchedCategory = categories?.find((item) => item.slug === categorySlug);
      
      // Set canonical from category if not already set
      if (!canonicalUrl && matchedCategory) {
        canonicalUrl = resolveCanonicalUrl(
          matchedCategory?.canonical_url,
          matchedCategory?.canonicalUrl,
          matchedCategory?.canonical
        );
      }
    } catch {
      // Ignore errors and continue
    }
  }

  if (categorySlug && subCategorySlug) {
    try {
      const subCategories = await getSubCategories({
        category_slug: categorySlug,
      }, "/company/sub-categories");
      matchedSubCategory = subCategories?.find(
        (item) => item.slug === subCategorySlug
      );
      
      // Set canonical from subcategory if available (overrides category)
      if (matchedSubCategory) {
        const subCanonicalUrl = resolveCanonicalUrl(
          matchedSubCategory?.canonical_url,
          matchedSubCategory?.canonicalUrl,
          matchedSubCategory?.canonical
        );
        if (subCanonicalUrl) {
          canonicalUrl = subCanonicalUrl;
        }
      }
    } catch {
      // Ignore errors and continue
    }
  }

  const alternates = await generateHreflangAlternates("/companies");
  if (canonicalUrl) {
    alternates.canonical = canonicalUrl;
  }

  if (override) {
    return {
      ...override,
      alternates,
    };
  }

  // Generate metadata based on category/subcategory data
  if (matchedSubCategory) {
    const title = matchedSubCategory?.meta_title || 
                  `${t("companies.titleByCategorySub")} ${matchedSubCategory.name}`;
    const description = matchedSubCategory?.meta_description || 
                        `${t("companies.descriptionByCategorySub")} ${matchedCategory?.name || categorySlug}, ${matchedSubCategory.name}`;
    
    return {
      title,
      description,
      alternates,
      robots: {
        index: matchedSubCategory?.is_index ?? true,
        follow: matchedSubCategory?.is_follow ?? true,
      },
    };
  }

  if (matchedCategory) {
    const title = matchedCategory?.meta_title || 
                  `${t("companies.titleByCategory")} ${matchedCategory.name}`;
    const description = matchedCategory?.meta_description || 
                        `${t("companies.descriptionByCategory")} ${matchedCategory.name}`;
    
    return {
      title,
      description,
      alternates,
      robots: {
        index: matchedCategory?.is_index ?? true,
        follow: matchedCategory?.is_follow ?? true,
      },
    };
  }

  // Fetch settings for default companies metadata
  try {
    const settings = await getSettings();
    if (settings?.meta?.companies) {
      const companiesMeta = settings.meta.companies;
      const companiesCanonicalUrl = resolveCanonicalUrl(
        companiesMeta?.canonical_url,
        companiesMeta?.canonicalUrl,
        companiesMeta?.canonical
      );
      
      if (companiesCanonicalUrl) {
        alternates.canonical = companiesCanonicalUrl;
      }
      
      return {
        title: companiesMeta?.meta_title || t("companies.defaultTitle"),
        description: companiesMeta?.meta_description || t("companies.defaultDescription"),
        alternates,
      };
    }
  } catch {
    // Ignore errors and use fallback
  }

  return {
    title: t("companies.defaultTitle"),
    description: t("companies.defaultDescription"),
    alternates,
  };
}

export default async function Companies({ searchParams, params }) {
  const paramsObj = await searchParams;
  const resolvedParams = await params;
  const locale = await getLocale();
  const metaT = await getTranslations("meta");

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
  const pageParamUrl = Number(paramsObj?.page) || 1;

  // Fetch category/subcategory data for page content
  let matchedCategory = null;
  let matchedSubCategory = null;

  if (category_slug) {
    try {
      const categories = await getCategories("/company/categories");
      matchedCategory = categories?.find((item) => item.slug === category_slug);
    } catch {
      // Ignore errors
    }
  }

  if (category_slug && sub_category_slug) {
    try {
      const subCategories = await getSubCategories({
        category_slug: category_slug,
      }, "/company/sub-categories");
      matchedSubCategory = subCategories?.find(
        (item) => item.slug === sub_category_slug
      );
    } catch {
      // Ignore errors
    }
  }

  // Fetch first page to get meta for fallback pagination when JS disabled
  let firstPageData;
  try {
    firstPageData = await getCompanyProducts({
      pageParam: pageParamUrl,
      lang,
      country_slug,
      type,
      sort,
      city_id,
      category_slug,
      sub_category_slug,
    });
  } catch (error) {
    console.error("[Companies Page] Failed to load initial data", error?.message);
    firstPageData = { data: { data: [], meta: { last_page: 1 } } };
  }

  await queryClient.prefetchInfiniteQuery({
    queryKey: [
      "company-products",
      country_slug,
      type,
      sort,
      city_id,
      category_slug,
      sub_category_slug,
      search,
      lang,
    ],
    queryFn: ({ pageParam = pageParamUrl }) =>
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
    initialPageParam: pageParamUrl,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });

  const initialProducts =
    firstPageData?.data?.data || firstPageData?.data || [];

  const visuallyHiddenStyle = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  };

  // Generate page title and description from category data
  let pageTitle;
  let pageDescription;

  if (matchedSubCategory) {
    pageTitle = matchedSubCategory.meta_title || 
                matchedSubCategory.name || 
                `${metaT("companies.titleByCategorySub")} ${sub_category_slug}`;
    pageDescription = matchedSubCategory.meta_description || 
                      `${metaT("companies.descriptionByCategorySub")} ${sub_category_slug}`;
  } else if (matchedCategory) {
    pageTitle = matchedCategory.meta_title || 
                matchedCategory.name || 
                `${metaT("companies.titleByCategory")} ${category_slug}`;
    pageDescription = matchedCategory.meta_description || 
                      `${metaT("companies.descriptionByCategory")} ${category_slug}`;
  } else if (category_slug && sub_category_slug) {
    pageTitle = `${metaT("companies.titleByCategorySub")} ${category_slug} - ${sub_category_slug}`;
    pageDescription = `${metaT("companies.descriptionByCategorySub")} ${category_slug}, ${sub_category_slug}`;
  } else if (category_slug) {
    pageTitle = `${metaT("companies.titleByCategory")} ${category_slug}`;
    pageDescription = `${metaT("companies.descriptionByCategory")} ${category_slug}`;
  } else {
    pageTitle = metaT("companies.defaultTitle");
    pageDescription = metaT("companies.defaultDescription");
  }

  const seoOverride = getSeoOverride({
    route: "companies",
    locale: resolvedParams?.["country-locale"] || locale,
    category: category_slug,
    subCategory: sub_category_slug,
  });

  const resolvedPageTitle = seoOverride?.h1 || seoOverride?.title || pageTitle;
  const resolvedPageDescription = seoOverride?.description || pageDescription;

  return (
    <div className="pt-4 pb-4">
      <h1 style={visuallyHiddenStyle}>{resolvedPageTitle}</h1>

      {/* Display category description if available */}
      {resolvedPageDescription && (
        <div className="container mb-3">
          <p className="text-muted">{resolvedPageDescription}</p>
        </div>
      )}

      <FilterCompanySection selectedCategory={category_slug} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductList initialProducts={initialProducts} />
      </HydrationBoundary>

      {/* Fallback pagination for no-JS environments */}
      {/* {(() => {
        const meta = firstPageData?.data?.meta || firstPageData?.meta || {};
        const lastPage = meta.last_page || 1;
        if (lastPage <= 1) return null;
        return (
          <nav aria-label="Pagination" className="pagination-wrapper text-center my-4">
            <ul className="list-unstyled m-0 p-0 d-inline-flex gap-2">
              {pageParamUrl > 1 && (
                <li>
                  <a href={`?page=${pageParamUrl - 1}`} rel="prev" className="px-3 py-1 border rounded">
                    « Prev
                  </a>
                </li>
              )}
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <li key={p}>
                  <a
                    href={p === 1 ? "" : `?page=${p}`}
                    aria-current={p === pageParamUrl ? "page" : undefined}
                    className={`px-3 py-1 border rounded ${p === pageParamUrl ? "active" : ""}`}
                  >
                    {p}
                  </a>
                </li>
              ))}
              {pageParamUrl < lastPage && (
                <li>
                  <a href={`?page=${pageParamUrl + 1}`} rel="next" className="px-3 py-1 border rounded">
                    Next »
                  </a>
                </li>
              )}
            </ul>
          </nav>
        );
      })()} */}

      {/* Fallback pagination for no-JS environments */}
      <Pagination
        currentPage={pageParamUrl}
        totalPages={
          firstPageData?.data?.meta?.last_page ||
          firstPageData?.meta?.last_page ||
          1
        }
      />
    </div>
  );
}
