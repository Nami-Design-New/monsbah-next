"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { PRODUCT_CARD_SIZES, IMAGE_QUALITY } from "@/utils/imageConfig";
import styles from "./CategoryProductsSection.module.css";

export default function CategoryProductsSection({ title, categorySlug, products = [], showViewAll = true }) {
  const t = useTranslations();
  if (!products?.length) return null;

  return (
    <section className={styles.categoryProductsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{title}</h2>
          {showViewAll && (
            <Link href={`/${categorySlug}`} className={styles.viewAllBtn}>
              {t("viewAll") || "عرض الكل"}
              <i className="fa-light fa-arrow-left"></i>
            </Link>
          )}
        </div>

        <div className={styles.productsCarousel}>
          <Swiper
            modules={[Navigation]}
            slidesPerView="auto"
            spaceBetween={16}
            navigation={{ nextEl: `.${categorySlug}-next`, prevEl: `.${categorySlug}-prev` }}
            className="products-swiper"
          >
            {products.map((product, idx) => {
              const uniqueKey = `product-${idx}-${product?.id || 'no-id'}`;
              const src = String(product?.image || "").trim();
              const isImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?|$)/i.test(src);
              const safeSrc = isImage ? src : "/banner.webp";

              return (
                <SwiperSlide key={uniqueKey} className="product-slide">
                  <Link href={`/product/${product?.slug}-id=${product?.id}`} className={styles.productCardMini}>
                    <div className={styles.productImage}>
                      <Image 
                        src={safeSrc} 
                        alt={product?.name || "product"} 
                        fill 
                        sizes={PRODUCT_CARD_SIZES.grid} 
                        quality={IMAGE_QUALITY.card} 
                        style={{ objectFit: "cover" }} 
                      />
                      {product?.is_popular && (
                        <span className={styles.popularBadge}>
                          {t("popular") || "مميز"}
                        </span>
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product?.name}</h3>
                      <p className={styles.productPrice}>
                        <span>{product?.price}</span> {product?.currency?.name}
                      </p>
                      <p className={styles.productLocation}>
                        <i className="fa-light fa-location-dot"></i>
                        {product?.city?.name || product?.country?.name}
                      </p>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button className={`${styles.swiperNavBtn} ${styles.prevBtn} ${categorySlug}-prev`}>
            <i className="fa-light fa-chevron-right"></i>
          </button>
          <button className={`${styles.swiperNavBtn} ${styles.nextBtn} ${categorySlug}-next`}>
            <i className="fa-light fa-chevron-left"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
