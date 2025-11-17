"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function CompanyPageCategoriesSlider({ categories }) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "";

  // Build URL for each category
  const buildCategoryUrl = (categorySlug) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (!categorySlug) {
      // "All" - remove category and sub_category
      params.delete("category");
      params.delete("sub_category");
    } else {
      // Set category and remove sub_category
      params.set("category", categorySlug);
      params.delete("sub_category");
    }
    
    return `/companies${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <Swiper slidesPerView="auto" className="categories_slider">
      <SwiperSlide className="p-1">
        <Link
          href={buildCategoryUrl("")}
          aria-label="Show all categories"
          className={`category ${!selectedCategory ? "active" : ""}`}
        >
          <div className="img">
            <img src="/icons/all.svg" alt="All Categories" />
          </div>
          <h6>{t("all")}</h6>
        </Link>
      </SwiperSlide>

      {categories.map((category) => (
        <SwiperSlide key={category?.slug} className="p-1">
          <Link
             href={`/companies?category=${category.slug}`}
            className={`category ${
              selectedCategory === category.slug ? "active" : ""
            }`}
            aria-label={`Category ${category?.slug}`}
          >
            <div className="img">
              <img src={category?.icon} alt={category?.name || category?.slug || ""} />
            </div>
            <h6>{category?.name}</h6>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
