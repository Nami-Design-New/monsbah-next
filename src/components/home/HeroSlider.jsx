"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

export default function HeroSlider({ sliders = [] }) {
  const slidesCount = sliders.length;

  return (
    <section className="hero_section">
      <h2 className="visually-hidden">Hero Slider</h2>
      <div className="container">
        <div className="swiper_wrapper">
          {slidesCount > 1 && (
            <div className="swiperControl d-none d-md-block">
              <div className="swiper-button-prev" />
              <div className="swiper-button-next" />
            </div>
          )}

          <Swiper
            speed={1000}
            effect="fade"
            loop={slidesCount > 1}
            modules={[Navigation, EffectFade, Autoplay, Pagination]}
            navigation={
              slidesCount > 1
                ? {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }
                : false
            }
            pagination={
              slidesCount > 1
                ? {
                    clickable: true,
                  }
                : false
            }
            spaceBetween={30}
            className="hero_swiper"
            autoplay={
              slidesCount > 1
                ? { delay: 3000, disableOnInteraction: false }
                : false
            }
          >
            {sliders.map((slider, index) => (
              <SwiperSlide key={slider?.id}>
                <div className="slider_link">
                  <Image
                    src={slider?.image}
                    alt={slider?.alt || slider?.title || "Monsbah slide"}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    quality={85}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
