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

// New components for redesigned home
import MainCategoriesGrid from "@/components/home/MainCategoriesGrid";
import CategoryProductsSection from "@/components/home/CategoryProductsSection";
import CompaniesSection from "@/components/home/CompaniesSection";
import PromoBanner from "@/components/home/PromoBanner";
import AddAdCTA from "@/components/home/AddAdCTA";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

// Services
import { getCategories } from "@/services/categories/getCategories";
import { getCompaniesCategories } from "@/services/categories/getCompaniesCategories";
import { getProductsByCategory } from "@/services/products/getProductsByCategory";

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

  // Fetch categories and products for new home sections
  const [categories, companiesCategories] = await Promise.all([
    getCategories(`/${user}/categories`),
    getCompaniesCategories()
  ]);

  // Get products for first 2 categories (for category sections)
  const firstTwoCategories = categories?.slice(0, 2) || [];
  const categoryProducts = await Promise.all(
    firstTwoCategories.map(async (cat) => ({
      ...cat,
      products: await getProductsByCategory({
        category_slug: cat.slug,
        lang,
        country_slug,
        limit: 10,
        user
      })
    }))
  );

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
      
      {/* Hero Slider */}
      <HeroSection />
      
      {/* الأقسام الأساسية - بطاقات كبيرة */}
      <MainCategoriesGrid categories={categories} />
      
      {/* بوستر دعائي أول */}
      <PromoBanner />
      
      {/* قسم المنتجات حسب الكاتيجوري الأول (مثل الفساتين) */}
      {categoryProducts[0] && categoryProducts[0].products?.length > 0 && (
        <CategoryProductsSection
          title={categoryProducts[0].name}
          categorySlug={categoryProducts[0].slug}
          products={categoryProducts[0].products}
        />
      )}
      
      {/* قسم المنتجات حسب الكاتيجوري الثاني (مثل الشنط) */}
      {categoryProducts[1] && categoryProducts[1].products?.length > 0 && (
        <CategoryProductsSection
          title={categoryProducts[1].name}
          categorySlug={categoryProducts[1].slug}
          products={categoryProducts[1].products}
        />
      )}
      
      {/* قسم الشركات */}
      <CompaniesSection categories={companiesCategories} />
      
      {/* قسم أضف إعلانك */}
      <AddAdCTA />
      
      {/* مميزات المنصة */}
      <FeaturesSection />
      
      {/* آراء العملاء */}
      <TestimonialsSection />
      
      {/* الفلاتر وقائمة المنتجات الأساسية */}
      {/* <FilterSection selectedCategory={null} selectedSubCategory={null} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsSection userType={user} />
      </HydrationBoundary> */}
    </CategoryTabProvider>
  );
}
