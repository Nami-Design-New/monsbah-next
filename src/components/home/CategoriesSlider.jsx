"use client";

import { useCallback, useTransition, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCategoryTab } from "./CategoryTabContext";

export default function CategoriesSlider({ categories, companiesCategories }) {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [_isPending, startTransition] = useTransition();
  const { activeTab, setActiveTab } = useCategoryTab();
  const selectedCategory = params?.category ?? "";
  const decoudedCategory = useMemo(
    () => decodeURIComponent(selectedCategory),
    [selectedCategory]
  );

  // Check URL for companies parameter and set active tab
  useEffect(() => {
    const companiesParam = searchParams.get("companies");
    if (companiesParam === "true") {
      if (activeTab !== "companies") {
        setActiveTab("companies");
      }
    } else if (!companiesParam && !selectedCategory) {
      if (activeTab === "companies") {
        setActiveTab("main");
      }
    }
  }, [searchParams, selectedCategory]); // Removed activeTab and setActiveTab from deps

  // Get categories based on active tab - memoized
  const filteredCategories = useMemo(
    () => (activeTab === "companies" ? companiesCategories : categories),
    [activeTab, companiesCategories, categories]
  );

  const handleSelectCategory = useCallback(
    (slug) => {
      if (!slug && !decoudedCategory) {
        return;
      }

      startTransition(() => {
        if (!slug) {
          // If companies tab is active, add query parameter
          router.push(activeTab === "companies" ? "/?companies=true" : "/");
        } else {
          router.push(`/${slug}`);
        }
      });
    },
    [router, decoudedCategory, activeTab, startTransition]
  );

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      
      startTransition(() => {
        router.push(tab === "companies" ? "/?companies=true" : "/");
      });
    },
    [setActiveTab, router, startTransition]
  );

  return (
    <div className="categories-wrapper">
      {/* Tab Buttons - Only show on home page (no category selected) */}
      {!decoudedCategory && (
        <div className="categories-tabs" style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "16px",
          justifyContent: "start"
        }}>
        <button
          className={`tab-button ${activeTab === "main" ? "active" : ""}`}
          onClick={() => handleTabChange("main")}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: activeTab === "main" ? "2px solid #1abc9c" : "2px solid #e0e0e0",
            backgroundColor: activeTab === "main" ? "#1abc9c" : "#fff",
            color: activeTab === "main" ? "#fff" : "#333",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontSize: "14px"
          }}
        >
          {t("main") || "الرئيسية"}
        </button>
        <button
          className={`tab-button ${activeTab === "companies" ? "active" : ""}`}
          onClick={() => handleTabChange("companies")}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: activeTab === "companies" ? "2px solid #1abc9c" : "2px solid #e0e0e0",
            backgroundColor: activeTab === "companies" ? "#1abc9c" : "#fff",
            color: activeTab === "companies" ? "#fff" : "#333",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontSize: "14px"
          }}
        >
          {t("companies") || "الشركات"}
        </button>
      </div>
      )}

      {/* Categories Slider */}
      <Swiper slidesPerView="auto" className="categories_slider">
        <SwiperSlide className="p-1">
          <button
            aria-label="Show all categories"
            className={`category ${!decoudedCategory ? "active" : ""}`}
            onClick={() => handleSelectCategory("")}
          >
            <span className="img">
              <img src="/icons/all.svg" alt="All Categories" />
            </span>
            <span className="category-name">{t("all")}</span>
          </button>
        </SwiperSlide>

        {filteredCategories?.map((category) => (
          <SwiperSlide key={category?.id || category?.slug} className="p-1">
            <Link
              className={`category ${decoudedCategory === category.slug ? "active" : ""}`}
              href={activeTab === "companies" ? `/companies?category=${category.slug}` : `/${category.slug}`}
              aria-label={`Category ${category?.slug}`}
              prefetch={false}
            >
              <div className="img">
                <img 
                  src={category?.icon} 
                  alt={category?.alt || category?.name || category?.slug}
                />
              </div>
              <h6>{category?.name}</h6>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
