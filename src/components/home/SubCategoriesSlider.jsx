"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  useSearchParams,
  useRouter,
  usePathname,
  useParams,
} from "next/navigation";

export default function SubCategoriesSlider({ subCategories }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const selectedSubCategory = params.subcategory ?? "";
  const decoudedSubCategory = decodeURIComponent(selectedSubCategory);

  const categoryName = params.category ?? "";
  const decoudedCategory = decodeURIComponent(categoryName);
  const handleSelectSubCategory = useCallback(
    (newValue) => {
      if (!decoudedCategory) {
        // If categoryName is missing, just push subcategory or home
        router.push(newValue ? `/${newValue}` : `/`);
        return;
      }

      if (!newValue) {
        // Remove subcategory
        router.push(`/${decoudedCategory}`);
      } else {
        // Navigate to category/subcategory
        router.push(`/${decoudedCategory}/${newValue}`);
      }
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
