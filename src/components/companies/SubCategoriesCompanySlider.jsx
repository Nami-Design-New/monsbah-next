"use client";

import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function SubCategoriesCompanySlider({ subCategories }) {
  const t = useTranslations();
  const searchParams = useSearchParams();

  // Build URL for each subcategory
  const buildSubCategoryUrl = (subCategorySlug) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (!subCategorySlug) {
      // "All" - remove sub_category but keep category
      params.delete("sub_category");
    } else {
      // Set sub_category
      params.set("sub_category", subCategorySlug);
    }
    
    return `/companies${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <Swiper slidesPerView="auto" className="categories_slider">
      <SwiperSlide className="p-1">
        <Link
          href={buildSubCategoryUrl("")}
          aria-label="Subcategory"
          className={`category sub ${!searchParams.get("sub_category") ? "active" : ""}`}
        >
          <p className="category-name">{t("all")}</p>
        </Link>
      </SwiperSlide>

      {subCategories?.map((sub) => (
        <SwiperSlide key={sub.id} className="p-1">
          <Link
            
            href={buildSubCategoryUrl(sub?.slug)}
            className={`category sub ${
              searchParams.get("sub_category") === sub?.slug ? "active" : ""
            }`}
          >
            <p style={{  fontSize: "14px", fontWeight: "600" }} className="category-name">{sub?.name}</p>
          </Link>
          
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
