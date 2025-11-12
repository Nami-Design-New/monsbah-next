"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "use-intl";

export default function CompanyCategoriesSlider({ categories }) {
  const t = useTranslations();
  const searchParams = useSearchParams();

  // Build URL for each subcategory
  const buildSubCategoryUrl = (categoryId) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("sub_category", categoryId);
    } else {
      params.delete("sub_category");
    }

    return `?${params.toString()}`;
  };

  return (
    <div className="col-12 p-2">
      <Swiper slidesPerView="auto" spaceBetween={10} className="categories">
        <SwiperSlide>
          <Link
            href={buildSubCategoryUrl(null)}
            className={`${Number(searchParams.get("sub_category")) === 0 ? "active" : ""}`}
          >
            {t("all")}
          </Link>
        </SwiperSlide>

        {categories?.map((category) => (
          <SwiperSlide key={category.id}>
            <Link
              href={buildSubCategoryUrl(category?.id)}
              className={`${
                Number(searchParams.get("sub_category")) === category?.id
                  ? "active"
                  : ""
              }`}
            >
              {category.name}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
