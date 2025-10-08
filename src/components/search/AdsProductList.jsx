"use client";

import React, { useEffect, useRef } from "react";
import ProductVertical from "../shared/cards/ProductVertical";
import useGetAds from "@/hooks/queries/search/useGetAds";
import ProductLoader from "../shared/loaders/ProductLoader";

export default function AdsProductList() {
  const sectionRef = useRef();
  const {
    data: ads,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAds();

  const allAds = ads?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const sectionBottom = section.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;

      if (
        sectionBottom <= viewportHeight + 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="row" ref={sectionRef}>
      {allAds?.map((ad, index) => (
        <div className="col-lg-4 col-md-6 col-12 p-2" key={index}>
          <ProductVertical
            product={ad}
            isShowAction={false}
            // setProducts={setProducts}
          />
        </div>
      ))}

      {(isLoading || isFetchingNextPage) && (
        <>
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div className="col-lg-4 col-md-6 col-12 p-2" key={index}>
                <ProductLoader />
              </div>
            ))}
        </>
      )}
    </div>
  );
}
