"use client";

import { useRef, useEffect, useState } from "react";
import ProductLoader from "@/components/shared/loaders/ProductLoader";
import ProductVertical from "../shared/cards/ProductVertical";
import ProductVerticalCompany from "../shared/cards/ProductVerticalCompany";
import useGetProducts from "@/hooks/queries/products/useGetProducts";
import useGetCompanyProducts from "@/hooks/queries/products/useGetCompanyProducts";
import Pagination from "@/components/shared/Pagination";
import { useCategoryTab } from "./CategoryTabContext";

export default function ProductsSection({ userType, initialProducts = [] }) {
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const { activeTab } = useCategoryTab();

  // Use different hooks based on active tab
  const regularProducts = useGetProducts(userType);
  const companyProducts = useGetCompanyProducts();

  // Select the appropriate data based on active tab
  const {
    data: products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    currentPage,
    lastPage,
  } = activeTab === "companies" ? companyProducts : regularProducts;

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
              <div
                className="col-lg-4 col-md-6 col-12 p-2"
                key={product?.id || product?.slug}
              >
                {activeTab === "companies" || userType === "company" ? (
                  <ProductVerticalCompany
                    product={product}
                    isShowAction={false}
                  />
                ) : (
                  <ProductVertical product={product} isShowAction={false} />
                )}
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
            {(isClient && isFetchingNextPage && productsToRender.length > 0) &&
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  style={{display:"flex"}}
                  className="col-lg-4 col-md-6 col-12 p-2"
                  key={`loader-${index}`}
                >
                  <ProductLoader />
                </div>
              ))}
          </div>
      
        
        </div>
      </section>
      
      {/* Pagination links (SEO-friendly, work without JS) */}
      <Pagination currentPage={currentPage} totalPages={lastPage} />
    </>
  );
}
