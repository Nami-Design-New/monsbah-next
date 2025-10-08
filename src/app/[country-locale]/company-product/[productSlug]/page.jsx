import Comments from "@/components/product/Comments";
import MyProductSlider from "@/components/product/MyProductSlider";
import ProductInfo from "@/components/product/ProductInfo";
import UserCard from "@/components/product/UserCard";
import UserCardCompany from "@/components/product/UserCardCompany";
import { getProduct } from "@/services/products/getProduct";
import { cache } from "react";
import { generateHreflangAlternatesForProduct } from "@/utils/hreflang";

export const fetchProduct = cache(async (id) => {
  return await getProduct(id);
});

export async function generateMetadata({ params }) {
  const { productSlug } = await params;
  const decodedSlug = decodeURIComponent(productSlug);

  const product = await fetchProduct(decodedSlug);

  if (process?.env?.NODE_ENV !== "production") {
    const c = product?.country || {};
  }

  const pathname = `/company-product/${productSlug}`;
  const alternates = generateHreflangAlternatesForProduct(pathname, product);

  return {
    title: product.meta_title,
    description: product.meta_description,

    openGraph: {
      title: product.meta_title,
      description: product.meta_description,
      images: product.images,
      url: `https://www.monsbah.com/products/${productSlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.meta_title,
      description: product.meta_description,
      images: product.images,
    },
    alternates,
    robots: {
      index: product.is_index,
      follow: product.is_follow,
    },
  };
}

export default async function page({ params }) {
  const { productSlug } = await params;

  const decodedSlug = decodeURIComponent(productSlug);

  const product = await fetchProduct(decodedSlug);

  return (
    <section className="product_details">
      <div className="container p-0">
        <div className="row m-0">
          <div className="col-lg-7 col-12 p-lg-3 p-2">
            <MyProductSlider product={product} />
            <ProductInfo product={product} />
          </div>
          <div className="col-lg-5 col-12 p-lg-3 p-2 ">
            <div className="d-flex flex-column gap-4">
              <UserCardCompany product={product} />
              <Comments product={product} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
