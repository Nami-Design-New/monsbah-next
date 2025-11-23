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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useGetCompanyProducts();

  const allProducts =
    products?.pages?.flatMap((page) => page?.data?.data) ?? [];
  
  // Deduplicate products by ID
  const uniqueProducts = Array.from(
    new Map(allProducts.map((product) => [product?.id, product])).values()
  );

  const productsToRender = uniqueProducts.length > 0 ? uniqueProducts : initialProducts;

  // Show skeleton loaders when filtering or on initial load (not during pagination)
  const isFilteringOrLoading = isFetching && !isFetchingNextPage;

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
    <>
      <section className="products_section" ref={sectionRef} suppressHydrationWarning>
        <div className="container p-1">
          <div className="row">
            {!isFilteringOrLoading && productsToRender.map((product) => (
              <div className="col-lg-4 col-md-6 col-12 p-2" key={product?.id || product?.slug}>
                <ProductVerticalCompany product={product} isShowAction={false} />
              </div>
            ))}

            {isFilteringOrLoading &&
              Array(6)
                .fill(0)
                .map((_, index) => (
                  <div
                    className="col-lg-4 col-md-6 col-12 p-2"
                    key={`loader-${index}`}
                  >
                    <ProductLoader />
                  </div>
                ))}
              {isClient && isFetchingNextPage && productsToRender.length > 0 && (
          <div
                    className="col-lg-4 col-md-6 col-12 p-2"
                    key={`loader-${index}`}
                  >
                    <ProductLoader />
                  </div>
          )}
          </div>
        
        </div>
      </section>
    </>
  );
}
