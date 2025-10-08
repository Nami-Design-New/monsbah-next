"use client";

import useGetCompanyFavorites from "@/hooks/queries/favorite/useGetCompanyFavorites";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import ProductVertical from "../shared/cards/ProductVertical";
import EmptyData from "../shared/EmptyData";
import ProductLoader from "../shared/loaders/ProductLoader";

export default function CompanyFavoritesList() {
  const sectionRef = useRef();
  const t = useTranslations();

  const {
    data: favorites,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCompanyFavorites();

  const allFavs = favorites?.pages?.flatMap((page) => page?.data?.data) ?? [];

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
    <section className="products_section w-100 my-5" ref={sectionRef}>
      <div className="container">
        <div className="row">
          {allFavs?.map((fav) => (
            <div className="col-lg-4 col-md-6 col-12 p-2" key={fav?.id}>
              <ProductVertical product={fav} removeItem={true} />
            </div>
          ))}
          {(isLoading || isFetchingNextPage) && (
            <>
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    className="col-lg-4 col-md-6 col-12 p-2"
                    key={`loader-${index}`}
                  >
                    <ProductLoader className="my-ad" />
                  </div>
                ))}
            </>
          )}
        </div>
        {!isLoading &&
          !isFetchingNextPage &&
          allFavs?.length === 0 &&
          !hasNextPage && (
            <EmptyData minHeight="200px">
              <p>{t("profile.noFavoritesYet")}</p>
            </EmptyData>
          )}
      </div>
    </section>
  );
}
