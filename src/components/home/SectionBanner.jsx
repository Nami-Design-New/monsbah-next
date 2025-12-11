"use client";

import Image from "next/image";
import { PRODUCT_CARD_SIZES, IMAGE_QUALITY } from "@/utils/imageConfig";

const banners = [
  {
    id: 1,
    image: "/banner1.webp",
  },
  {
    id: 2,
    image: "/banner2.webp",
  },
];

export default function SectionBanner({ index = 0 }) {
  const banner = banners[index % banners.length];

  return (
    <section className="hero_section" aria-label="Banner">
      <div className="container">
        <div className="swiper_wrapper">
          <div className="hero_swiper" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div className="slider_link">
              <Image
                src={banner.image}
                alt="Monsbah banner"
                fill
                sizes={PRODUCT_CARD_SIZES.hero}
                quality={IMAGE_QUALITY.hero}
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
