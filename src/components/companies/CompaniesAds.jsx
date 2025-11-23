"use client";

import React, { useRef } from "react";
import ProductVertical from "../shared/cards/ProductVertical";
import useGetCompanyProducts from "@/hooks/queries/products/useGetCompanyProducts";
import CompanyLoader from "../shared/loaders/CompanyLoader";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function CompaniesAds() {
  const sectionRef = useRef(null);

  const {
    data: products,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCompanyProducts();
  const allProducts =
    products?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useInfiniteScroll({
    ref: sectionRef,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
    offset: 200,
    debounceMs: 250,
  });

  return (
    <section className="companies_section" ref={sectionRef}>
      <div className="container p-1">
        <div className="row">
          {allProducts?.map((product, index) => (
            <div className="col-lg-4 col-md-6 col-12 p-2" key={index}>
              <ProductVertical product={product} isShowAction={false} />
            </div>
          ))}{" "}
          {(isLoading || isFetchingNextPage) && (
            <>
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    className="col-lg-4 col-md-6 col-12 p-2"
                    key={`loader-${index}`}
                  >
                    <CompanyLoader />
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
