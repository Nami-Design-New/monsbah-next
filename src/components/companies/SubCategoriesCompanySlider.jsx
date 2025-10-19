"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SubCategoriesCompanySlider({ subCategories }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectSubCategory = useCallback(
    (slug) => {
      const params = new URLSearchParams(window.location.search);
      
      if (!slug) {
        // Remove sub_category param
        params.delete("sub_category");
      } else {
        // Set new sub_category
        params.set("sub_category", slug);
      }
      
      const newUrl = `/companies${params.toString() ? `?${params.toString()}` : ""}`;
      router.push(newUrl);
    },
    [router]
  );

  return (
    <Swiper slidesPerView="auto" className="categories_slider">
      <SwiperSlide className="p-1">
        <button
          aria-label="Subcategory"
          className={`category sub ${!searchParams.get("sub_category") ? "active" : ""}`}
          onClick={() => handleSelectSubCategory("")}
        >
          <h6>{t("all")}</h6>
        </button>
      </SwiperSlide>

      {subCategories?.map((sub) => (
        <SwiperSlide key={sub.id} className="p-1">
          <button
            className={`category sub ${
              searchParams.get("sub_category") === sub?.slug ? "active" : ""
            }`}
            onClick={() => handleSelectSubCategory(sub?.slug)}
          >
            <h6>{sub?.name}</h6>
          </button>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
