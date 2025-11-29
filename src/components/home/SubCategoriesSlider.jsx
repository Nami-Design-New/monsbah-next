"use client";

import { useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";

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
          <p style={{  fontSize: "14px", fontWeight: "600" }} className="category-name">{t("all")}</p>
        </button>
      </SwiperSlide>

      {subCategories?.map((sub) => (
        <SwiperSlide key={sub.id} className="p-1">
          <Link
            className={`category sub ${
              decoudedSubCategory === sub?.slug ? "active" : ""
            }`}
            href={`/${decoudedCategory}/${sub.slug}`}
          >
            <p style={{  fontSize: "14px", fontWeight: "600" }} className="category-name">{sub?.name}</p>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
