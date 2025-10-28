import Comments from "@/components/product/Comments";
import MyProductSlider from "@/components/product/MyProductSlider";
import ProductInfo from "@/components/product/ProductInfo";
import UserCard from "@/components/product/UserCard";
import { getProduct } from "@/services/products/getProduct";
import { cache } from "react";
import { generateHreflangAlternatesForProduct } from "@/utils/hreflang";
import { notFound, permanentRedirect } from "next/navigation";
import { getManualProductRedirect } from "@/utils/manual-redirects";
import { resolveCanonicalUrl } from "@/utils/canonical";

export const fetchProduct = cache(async (id ,country_slug ) => {
  return await getProduct(id , country_slug);
});

export async function generateMetadata({ params }) {
  const { productSlug , "country-locale":countryLocale } = await params;
  const decodedSlug = decodeURIComponent(productSlug);
  const country_slug = countryLocale.split("-")[0];
  
  try {
    const product = await fetchProduct(decodedSlug, country_slug);

    const pathname = `/product/${productSlug}`;
    const alternates = await generateHreflangAlternatesForProduct(
      pathname,
      product
    );
    const canonicalUrl = resolveCanonicalUrl(
      product?.canonical_url,
      product?.canonicalUrl,
      product?.canonical
    );
    if (canonicalUrl) {
      alternates.canonical = canonicalUrl;
    }
    const defaultPageUrl = `https://www.monsbah.com/product/${productSlug}`;
    const pageUrl = canonicalUrl || defaultPageUrl;

    // Use product title (name) instead of meta_title to avoid duplication
    // The layout.jsx will append "- مناسبة" or "- Monsbah" via template
    return {
      title: product?.title || product?.name,
      description: product?.meta_description || product?.description,

      openGraph: {
        title: product?.title || product?.name,
        description: product?.meta_description || product?.description,
        images: product?.images,
        url: pageUrl,
      },
      twitter: {
        card: "summary_large_image",
        title: product?.title || product?.name,
        description: product?.meta_description || product?.description,
        images: product?.images,
      },
      alternates,
      robots: {
        index: product?.is_index !== false,
        follow: product?.is_follow !== false,
      },
    };
  } catch {
    // Return default metadata if product fetch fails
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
}

export default async function page({ params }) {
  const { productSlug ,"country-locale":countryLocale } = await params;
  const country_slug = countryLocale.split("-")[0];

  const decodedSlug = decodeURIComponent(productSlug);

  let product;

  try {
    product = await fetchProduct(decodedSlug, country_slug);
  } catch (error) {
    console.error("[Product Page] Failed to load product", error?.message);
    const redirectTarget = getManualProductRedirect({
      locale: countryLocale,
      slug: decodedSlug,
    });

    if (redirectTarget) {
      permanentRedirect(redirectTarget);
    }

    const status = error?.response?.status ?? error?.status;
    if (status === 404) {
      notFound();
    }

    throw error;
  }

  if (!product) {
    const redirectTarget = getManualProductRedirect({
      locale: countryLocale,
      slug: decodedSlug,
    });

    if (redirectTarget) {
      permanentRedirect(redirectTarget);
    }

    notFound();
  }

  return (
    <section className="product_details">
      <div className="container p-0">
        <header className="py-3">
          <h1 className="h3 mb-0">
            {product?.name || product?.title || decodedSlug}
          </h1>
        </header>
        <div className="row m-0">
          <div className="col-lg-7 col-12 p-lg-3 p-2">
            <MyProductSlider product={product} />
            <ProductInfo product={product} />
          </div>
          <div className="col-lg-5 col-12 p-lg-3 p-2 ">
            <div className="d-flex flex-column gap-4">
              <UserCard product={product} />
              <Comments product={product} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
