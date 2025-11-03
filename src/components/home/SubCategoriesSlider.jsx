"use client";

import { useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export default function SubCategoriesSlider({ subCategories }) {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [_isPending, startTransition] = useTransition();

  const selectedSubCategory = params.subcategory ?? "";
  const decoudedSubCategory = decodeURIComponent(selectedSubCategory);

  const categoryName = params.category ?? "";
  const decoudedCategory = decodeURIComponent(categoryName);
  
  const handleSelectSubCategory = useCallback(
    (newValue) => {
      startTransition(() => {
        if (!decoudedCategory) {
          router.push(newValue ? `/${newValue}` : `/`);
          return;
        }

        if (!newValue) {
          router.push(`/${decoudedCategory}`);
        } else {
          router.push(`/${decoudedCategory}/${newValue}`);
        }
      });
    },
    [router, decoudedCategory]
  );

  return (
    <Swiper slidesPerView="auto" className="categories_slider">
      <SwiperSlide className="p-1">
        <button
          aria-label="Subcategory"
          className={`category sub ${!decoudedSubCategory ? "active" : ""}`}
          onClick={() => handleSelectSubCategory("")}
        >
          <h6>{t("all")}</h6>
        </button>
      </SwiperSlide>

      {subCategories?.map((sub) => (
        <SwiperSlide key={sub.id} className="p-1">
          <button
            className={`category sub ${
              decoudedSubCategory === sub?.slug ? "active" : ""
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
