"use client";

import { useRef, useEffect } from "react";
import ProductLoader from "@/components/shared/loaders/ProductLoader";
import ProductVertical from "../shared/cards/ProductVertical";
import ProductVerticalCompany from "../shared/cards/ProductVerticalCompany";
import useGetProducts from "@/hooks/queries/products/useGetProducts";
import Pagination from "@/components/shared/Pagination";

export default function ProductsSection({ userType }) {
  const sectionRef = useRef(null);

  const {
    data: productsData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    currentPage,
    lastPage,
  } = useGetProducts(userType);
  console.log(productsData);

  const allProducts =
    productsData?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionBottom = section.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;

      if (sectionBottom <= viewportHeight + 200) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="products_section" ref={sectionRef}>
      <div className="container p-1">
        <div className="row">
          {allProducts.map((product, index) => (
            <div
              className="col-lg-4 col-md-6 col-12 p-2"
              key={product?.id || index}
            >
              {userType === "company" ? (
                <ProductVerticalCompany
                  product={product}
                  isShowAction={false}
                />
              ) : (
                <ProductVertical product={product} isShowAction={false} />
              )}
            </div>
          ))}
          {(isLoading || isFetchingNextPage) &&
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  className="col-lg-4 col-md-6 col-12 p-2"
                  key={`loader-${index}`}
                >
                  <ProductLoader />
                </div>
              ))}
        </div>
      </div>
      {/* Pagination links (SEO-friendly, work without JS) */}
      <Pagination currentPage={currentPage} totalPages={lastPage} />
    </section>
  );
}
