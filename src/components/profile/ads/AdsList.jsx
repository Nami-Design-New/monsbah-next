"use client";

import ProductVertical from "@/components/shared/cards/ProductVertical";
import EmptyData from "@/components/shared/EmptyData";
import ProductLoader from "@/components/shared/loaders/ProductLoader";
import useGetUserProducts from "@/hooks/queries/products/useGetUserProducts";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef } from "react";

export default function AdsList() {
  const sectionRef = useRef();
  const t = useTranslations();
  const {
    data: products,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetUserProducts();

  const allProducts =
    products?.pages?.flatMap((page) => page?.data?.data) ?? [];

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
    <section className="row" ref={sectionRef}>
      {allProducts?.map((product, index) => (
        <div className="col-12  col-lg-6  p-2" key={index}>
          <ProductVertical
            product={product}
            isShowAction={true}
            className="my-ad"
          />
        </div>
      ))}

      {(isLoading || isFetchingNextPage) && (
        <>
          {Array(2)
            .fill(0)
            .map((_, index) => (
              <div className="col-lg-6 col-12 p-2" key={`loader-${index}`}>
                <ProductLoader className="my-ad" />
              </div>
            ))}
        </>
      )}
      {!isLoading &&
        !isFetchingNextPage &&
        allProducts?.length === 0 &&
        !hasNextPage && (
          <EmptyData minHeight="100%">
            <p>{t("ads.noAdsForMe")}</p>
          </EmptyData>
        )}
    </section>
  );
}
