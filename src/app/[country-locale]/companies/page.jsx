import ProductList from "@/components/companies/ProductList";
import FilterCompanySection from "@/components/home/FilterCompanySection";
import { getCompanyProducts } from "@/services/companies/getCompanyProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";
import Pagination from "@/components/shared/Pagination";

// Mark as dynamic - uses searchParams
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const t = await getTranslations("meta");
  const category = (await searchParams)?.category;
  const sub_category = (await searchParams)?.sub_category;
  const alternates = await generateHreflangAlternates("/companies");

  if (category && sub_category) {
    return {
      title: `${t(
        "companies.titleByCategorySub"
      )} ${category} - ${sub_category}`,
      description: `${t(
        "companies.descriptionByCategorySub"
      )} ${category}, ${sub_category}`,
      alternates,
    };
  }

  if (category) {
    return {
      title: `${t("companies.titleByCategory")} ${category}`,
      description: `${t("companies.descriptionByCategory")} ${category}`,
      alternates,
    };
  }

  return {
    title: t("companies.defaultTitle"),
    description: t("companies.defaultDescription"),
    alternates,
  };
}

export default async function Companies({ searchParams, params }) {
  const paramsObj = await searchParams;
  const { id } = await params;
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
  const pageParamUrl = Number(paramsObj?.page) || 1;

  // Fetch first page to get meta for fallback pagination when JS disabled
  const firstPageData = await getCompanyProducts({
    pageParam: pageParamUrl,
    lang,
    country_slug,
    type,
    sort,
    city_id,
    category_slug,
    sub_category_slug,
  });

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

  return (
    <div className="pt-4 pb-4">
      <FilterCompanySection selectedCategory={category_slug} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductList />
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
        totalPages={firstPageData?.data?.meta?.last_page || 1}
      />
    </div>
  );
}
