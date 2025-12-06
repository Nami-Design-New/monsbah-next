"use client";

import Image from "next/image";
import styles from "./PromoBanner.module.css";

/**
 * PromoBanner - بوستر دعائي
 * عرض 2 صورة للعروض الخاصة
 */
export default function PromoBanner({ banners = [] }) {
  // Default banners if none provided
  const defaultBanners = [
    {
      id: 1,
      image: "/banner.webp",
      alt: "عروض خاصة",
      link: "/offers"
    },
    {
      id: 2,
      image: "/banner.webp", 
      alt: "تخفيضات",
      link: "/offers"
    }
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  return (
    <section className={styles.promoBannerSection}>
      <div className="container">
        <div className={styles.bannersGrid}>
          {displayBanners.slice(0, 2).map((banner, index) => (
            <a
              key={banner.id || index}
              href={banner.link || "#"}
              className={styles.bannerCard}
              aria-label={banner.alt}
            >
              <Image
                src={banner.image}
                alt={banner.alt || "Promo banner"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                quality={85}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
