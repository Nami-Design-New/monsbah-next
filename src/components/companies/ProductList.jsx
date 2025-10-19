"use client";

import { useRef, useEffect, useState } from "react";
import ProductVerticalCompany from "../shared/cards/ProductVerticalCompany";
import ProductLoader from "@/components/shared/loaders/ProductLoader";
import useGetCompanyProducts from "@/hooks/queries/products/useGetCompanyProducts";

export default function ProductList() {
  const sectionRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const {
    data: products,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCompanyProducts();

  const allProducts =
    products?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useEffect(() => {
    setMounted(true);
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
          {mounted && allProducts.map((product) => (
            <div className="col-lg-4 col-md-6 col-12 p-2" key={product?.id || product?.slug}>
              <ProductVerticalCompany product={product} isShowAction={false} />
            </div>
          ))}

          {(!mounted || isLoading || isFetchingNextPage) &&
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
    </section>
  );
}
