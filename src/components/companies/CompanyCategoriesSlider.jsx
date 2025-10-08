"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "use-intl";

export default function CompanyCategoriesSlider({ categories }) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = (categoryId) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("sub_category", categoryId);
    } else {
      params.delete("sub_category");
    }

    router.push(`?${params.toString()}`);
  };
  return (
    <div className="col-12 p-2">
      <Swiper slidesPerView="auto" spaceBetween={10} className="categories">
        <SwiperSlide>
          <button
            className={
              Number(searchParams.get("sub_category")) === 0 ? "active" : ""
            }
            onClick={() => handleSearch(null)}
          >
            {t("all")}
          </button>
        </SwiperSlide>

        {categories?.map((category) => (
          <SwiperSlide key={category.id}>
            <button
              className={
                Number(searchParams.get("sub_category")) === category?.id
                  ? "active"
                  : ""
              }
              onClick={() => handleSearch(category?.id)}
            >
              {category.name}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
