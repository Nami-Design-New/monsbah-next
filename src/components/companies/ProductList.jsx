"use client";

import { useRef, useEffect, useState } from "react";
import ProductVerticalCompany from "../shared/cards/ProductVerticalCompany";
import ProductLoader from "@/components/shared/loaders/ProductLoader";
import useGetCompanyProducts from "@/hooks/queries/products/useGetCompanyProducts";

export default function ProductList({ initialProducts = [] }) {
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  const {
    data: products,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCompanyProducts();

  const allProducts =
    products?.pages?.flatMap((page) => page?.data?.data) ?? [];

  const productsToRender = allProducts.length > 0 ? allProducts : initialProducts;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const sectionBottom = sectionRef.current.getBoundingClientRect().bottom;
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
    <section className="products_section" ref={sectionRef} suppressHydrationWarning>
      <div className="container p-1">
        <div className="row">
          {productsToRender.map((product) => (
            <div className="col-lg-4 col-md-6 col-12 p-2" key={product?.id || product?.slug}>
              <ProductVerticalCompany product={product} isShowAction={false} />
            </div>
          ))}

          {(isClient && isLoading && productsToRender.length === 0) &&
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
        {isClient && isFetchingNextPage && productsToRender.length > 0 && (
          <div className="text-center py-3" role="status" aria-live="polite">
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            <span className="ms-2">Loading more companies…</span>
          </div>
        )}
      </div>
    </section>
  );
}
