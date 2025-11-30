"use client";

import Image from "next/image";

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
    <section className="promo-banner-section">
      <div className="container">
        <div className="banners-grid">
          {displayBanners.slice(0, 2).map((banner, index) => (
            <a
              key={banner.id || index}
              href={banner.link || "#"}
              className="banner-card"
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

      <style jsx>{`
        .promo-banner-section {
          padding: 32px 0;
          background: #fff;
        }

        .banners-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          .banners-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        .banner-card {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 21/9;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .banner-card:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </section>
  );
}
