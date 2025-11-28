import FilterSection from "@/components/home/FilterSection";
import HeroSection from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import CountrySelectorModal from "@/components/home/CountrySelectorModal";
import { CategoryTabProvider } from "@/components/home/CategoryTabContext";
import { getUserType } from "@/services/auth/getUserType";
import getProducts from "@/services/products/getProducts";
import { getSettings } from "@/services/settings/getSettings";
import { META_DATA_CONTENT } from "@/utils/constants";
import { resolveCanonicalUrl } from "@/utils/canonical";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses searchParams for filtering
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const lang = locale.split("-")[1];
  const content = META_DATA_CONTENT[lang] ?? META_DATA_CONTENT.ar;
  const settings = await getSettings();
  
  // Use meta_title for page title, fallback to name
  const title = settings?.meta_title || settings?.name || content.title;
  const siteName = settings?.name || content.title;
  const description = settings?.meta_description || content.description;

  const alternates = await generateHreflangAlternates("/");
  const canonicalUrl = resolveCanonicalUrl(
    settings?.canonical_url,
    settings?.canonicalUrl
  );
  if (canonicalUrl) {
    alternates.canonical = canonicalUrl;
  }
  return {
    title: {
      absolute: title,
    },
    applicationName: siteName,
    description,
    openGraph: {
      title,
      siteName,
      description,
    },
    other: {
      "google-site-verification": "kOD-M71HEym30Cx4W8U0FqAJXpQy8f5TgdYkxqNXeAk",
      "og:site_name": siteName,
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
    <CategoryTabProvider>
      <CountrySelectorModal />
      <HeroSection />
      <FilterSection selectedCategory={null} selectedSubCategory={null} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsSection userType={user} />
      </HydrationBoundary>
    </CategoryTabProvider>
  );
}
