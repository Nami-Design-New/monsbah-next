"use client";

import React, { useEffect, useRef, useState } from "react";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { isValidVideoExtension } from "@/utils/helpers";
import { useRouter } from "@/i18n/navigation";

export default function MyProductSlider({ product }) {
  const router = useRouter();

  const [images, setImages] = useState([]);
  const [autoplayDelay, setAutoplayDelay] = useState(3000);
  const videoRef = useRef(null);
  useEffect(() => {
    const srcs = product?.images?.map((image) => image?.image);
    if (srcs) {
      setImages([product?.image, ...srcs]);
    }
  }, [product]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        const videoDuration = videoRef.current.duration * 1000;
        setAutoplayDelay(videoDuration);
      };
    }
  }, [videoRef]);

  // Initialize Fancybox on mount
  useEffect(() => {
    Fancybox.bind("[data-fancybox]", {});
  }, []);
  const slidesCount = images.length;

  return (
    <div className="swiper_wrapper">
      {slidesCount > 1 && (
        <div className="swiperControl d-none d-md-block">
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
        </div>
      )}
      <Swiper
        effect="fade"
        loop={slidesCount > 1}
        className="product_swiper"
        pagination={slidesCount > 1 ? { clickable: true } : false}
        navigation={
          slidesCount > 1
            ? {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }
            : false
        }
        modules={[Navigation, EffectFade, Autoplay, Pagination]}
        autoplay={
          slidesCount > 1
            ? { delay: autoplayDelay, disableOnInteraction: false }
            : false
        }
        onSlideChange={(swiper) => {
          if (swiper.realIndex === 0 && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setAutoplayDelay(videoRef.current.duration * 1000);
          } else {
            setAutoplayDelay(3000);
          }
        }}
      >
        {images?.map((image, index) => (
          <SwiperSlide key={index}>
            {isValidVideoExtension(image) ? (
              <video
                className="blurde_bg"
                src={image}
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img className="blurde_bg" src={image} alt="bluer_image" />
            )}
            <a href={image} data-fancybox="gallery">
              {isValidVideoExtension(image) ? (
                <video
                  src={image}
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img src={image} alt={image} />
              )}
            </a>
          </SwiperSlide>
        ))}
        <button className="arrow_icon" onClick={() => router.back()}>
          <i className="fa-solid fa-arrow-right-long"></i>
        </button>
      </Swiper>
    </div>
  );
}
