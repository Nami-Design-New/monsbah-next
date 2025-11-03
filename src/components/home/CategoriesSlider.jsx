"use client";

import { useCallback, useTransition } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function CategoriesSlider({ categories }) {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [_isPending, startTransition] = useTransition();
  const selectedCategory = params?.category ?? "";
  const decoudedCategory = decodeURIComponent(selectedCategory);

  const handleSelectCategory = useCallback(
    (slug) => {
      startTransition(() => {
        if (!slug) {
          router.push("/");
        } else {
          router.push(`/${slug}`);
        }
      });
    },
    [router]
  );

  return (
    <Swiper slidesPerView="auto" className="categories_slider">
      <SwiperSlide className="p-1">
        <button
          aria-label="Category"
          className={`category ${!decoudedCategory ? "active" : ""}`}
          onClick={() => handleSelectCategory("")}
        >
          <div className="img">
            <img src="/icons/all.svg" alt="All Categories" />
          </div>
          <h6>{t("all")}</h6>
        </button>
      </SwiperSlide>

      {categories.map((category) => (
        <SwiperSlide key={category?.slug} className="p-1">
          <button
            className={`category ${
              decoudedCategory == category.slug ? "active" : ""
            }`}
            onClick={() => handleSelectCategory(category?.slug)}
            aria-label={`Category ${category?.slug}`}
          >
            <div className="img">
              <img src={category?.image} alt={category?.alt || category?.name || category?.slug} />
            </div>
            <h6>{category?.name}</h6>
          </button>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
