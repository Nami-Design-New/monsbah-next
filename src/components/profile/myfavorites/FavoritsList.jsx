"use client";
import ProductVertical from "@/components/shared/cards/ProductVertical";
import EmptyData from "@/components/shared/EmptyData";
import ProductLoader from "@/components/shared/loaders/ProductLoader";
import useGetCompanyFavorites from "@/hooks/queries/favorite/useGetCompanyFavorites";
import useGetFavorites from "@/hooks/queries/favorite/useGetFavorites";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function FavoritsList() {
  const sectionRef = useRef();
  const t = useTranslations();

  const {
    data: favorites,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFavorites();

  const allFavs = favorites?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useInfiniteScroll({
    ref: sectionRef,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
    offset: 200,
    debounceMs: 250,
  });

  return (
    <>
      <div className="row" ref={sectionRef}>
        {allFavs?.map((fav) => (
          <div className="col-lg-6 col-12 p-2" key={fav?.id}>
            <ProductVertical
              product={fav}
              removeItem={true}
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
      </div>

      {!isLoading &&
        !isFetchingNextPage &&
        allFavs?.length === 0 &&
        !hasNextPage && (
          <EmptyData minHeight="200px">
            <p>{t("profile.noFavoritesYet")}</p>
          </EmptyData>
        )}
    </>
  );
}
