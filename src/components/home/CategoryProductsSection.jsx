"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { PRODUCT_CARD_SIZES, IMAGE_QUALITY } from "@/utils/imageConfig";

/**
 * CategoryProductsSection - قسم المنتجات حسب الكاتيجوري
 * عرض منتجات كل كاتيجوري في Carousel أفقي مع زر عرض الكل
 */
export default function CategoryProductsSection({ 
  title, 
  categorySlug, 
  products = [],
  showViewAll = true 
}) {
  const t = useTranslations();

  if (!products?.length) return null;

  return (
    <section className="category-products-section">
      <div className="container">
        <div className="section-header">
          <h2>{title}</h2>
          {showViewAll && (
            <Link href={`/${categorySlug}`} className="view-all-btn">
              {t("viewAll") || "عرض الكل"}
              <i className="fa-light fa-arrow-left"></i>
            </Link>
          )}
        </div>

        <div className="products-carousel">
          <Swiper
            modules={[Navigation]}
            slidesPerView="auto"
            spaceBetween={16}
            navigation={{
              nextEl: `.${categorySlug}-next`,
              prevEl: `.${categorySlug}-prev`,
            }}
            className="products-swiper"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="product-slide">
                <Link
                  href={`/product/${product.slug}-id=${product.id}`}
                  className="product-card-mini"
                >
                  <div className="product-image">
                    <Image
                      src={product.image || "/banner.webp"}
                      alt={product.name || "product"}
                      fill
                      sizes={PRODUCT_CARD_SIZES.grid}
                      quality={IMAGE_QUALITY.card}
                      style={{ objectFit: "cover" }}
                    />
                    {product.is_popular && (
                      <span className="popular-badge">
                        {t("popular") || "مميز"}
                      </span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">
                      <span>{product.price}</span> {product.currency?.name}
                    </p>
                    <p className="product-location">
                      <i className="fa-light fa-location-dot"></i>
                      {product.city?.name || product.country?.name}
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button className={`swiper-nav-btn ${categorySlug}-prev prev-btn`}>
            <i className="fa-light fa-chevron-right"></i>
          </button>
          <button className={`swiper-nav-btn ${categorySlug}-next next-btn`}>
            <i className="fa-light fa-chevron-left"></i>
          </button>
        </div>
      </div>

      <style jsx>{`
        .category-products-section {
          padding: 32px 0;
          background: #fff;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: #0d0d0d;
          margin: 0;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1abc9c;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          color: #16a085;
          gap: 12px;
        }

        .products-carousel {
          position: relative;
        }

        :global(.products-swiper) {
          padding: 8px 0;
        }

        :global(.product-slide) {
          width: 280px !important;
        }

        @media (max-width: 576px) {
          :global(.product-slide) {
            width: 220px !important;
          }
        }

        .product-card-mini {
          display: block;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .product-card-mini:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .product-image {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: #f8f8f8;
        }

        .popular-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #1abc9c;
          color: #fff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-info {
          padding: 12px;
        }

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: #0d0d0d;
          margin: 0 0 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          font-size: 16px;
          font-weight: 700;
          color: #1abc9c;
          margin: 0 0 4px;
        }

        .product-location {
          font-size: 12px;
          color: #666;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .swiper-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .swiper-nav-btn:hover {
          background: #1abc9c;
          color: #fff;
          border-color: #1abc9c;
        }

        .prev-btn {
          right: -20px;
        }

        .next-btn {
          left: -20px;
        }

        @media (max-width: 768px) {
          .swiper-nav-btn {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
