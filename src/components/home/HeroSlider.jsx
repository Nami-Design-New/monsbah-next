"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Pagination, Autoplay } from "swiper/modules";
import { Link } from "@/i18n/navigation";

export default function HeroSlider({ sliders = [] }) {
  const slidesCount = sliders.length;

  return (
    <section className="hero_section">
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
            {sliders.map((slider) => (
              <SwiperSlide key={slider?.id}>
                <div className="slider_link" aria-label="Slide">
                  <img src={slider?.image} alt="Monsbah slide" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
