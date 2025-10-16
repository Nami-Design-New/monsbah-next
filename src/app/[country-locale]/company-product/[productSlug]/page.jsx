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

  try {
    const product = await fetchProduct(decodedSlug);

    const pathname = `/company-product/${productSlug}`;
    const alternates = generateHreflangAlternatesForProduct(pathname, product);
    
    return {
      title: product?.title || product?.name, // Use product name instead of meta_title
      description: product?.meta_description || product?.description,

      openGraph: {
        title: product?.title || product?.name,
        description: product?.meta_description || product?.description,
        images: product?.images,
        url: `https://www.monsbah.com/company-product/${productSlug}`,
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
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
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
