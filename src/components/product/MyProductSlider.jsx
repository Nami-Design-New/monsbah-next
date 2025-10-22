"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { isValidVideoExtension } from "@/utils/helpers";
import { useRouter } from "@/i18n/navigation";

export default function MyProductSlider({ product }) {
  const router = useRouter();

  const initialImages = useMemo(() => {
    const galleryImages = product?.images?.map((image) => image?.image).filter(Boolean) || [];
    const coverImage = product?.image ? [product.image] : [];
    return [...coverImage, ...galleryImages];
  }, [product]);

  const [images, setImages] = useState(initialImages);
  const [autoplayDelay, setAutoplayDelay] = useState(3000);
  const [isClient, setIsClient] = useState(false);
  const videoRef = useRef(null);
  
  useEffect(() => {
    setIsClient(true);
    setImages(initialImages);
  }, [initialImages]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        const videoDuration = videoRef.current.duration * 1000;
        setAutoplayDelay(videoDuration);
      };
    }
  }, [videoRef]);

  useEffect(() => {
    Fancybox.bind("[data-fancybox]", {});
  }, []);
  
  const slidesCount = images.length;

  if (!isClient) {
    if (!images || images.length === 0) {
      return (
        <div className="swiper_wrapper" style={{ minHeight: "400px" }}>
          <div className="d-flex align-items-center justify-content-center h-100">
            <p className="text-center mb-0">No media available for this product.</p>
          </div>
        </div>
      );
    }

    const primaryMedia = images[0];
    const remainingMedia = images.slice(1, 4); // show up to three additional thumbnails

    return (
      <div className="swiper_wrapper no-js">
        <figure className="no-js-slide mb-3">
          {isValidVideoExtension(primaryMedia) ? (
            <video
              src={primaryMedia}
              controls
              playsInline
              preload="metadata"
              className="w-100 rounded"
            >
              Sorry, your browser does not support embedded videos.
            </video>
          ) : (
            <img
              src={primaryMedia}
              alt={product?.name || "Product image"}
              className="w-100 rounded"
            />
          )}
        </figure>

        {remainingMedia.length > 0 && (
          <div className="d-flex gap-2 flex-wrap">
            {remainingMedia.map((media, index) => (
              <figure key={`no-js-thumb-${index}`} className="no-js-thumb m-0">
                <a href={media}>
                  {isValidVideoExtension(media) ? (
                    <video
                      src={media}
                      muted
                      playsInline
                      preload="metadata"
                      className="rounded"
                      style={{ maxWidth: "120px" }}
                    />
                  ) : (
                    <img
                      src={media}
                      alt={`${product?.name || "Product"} thumbnail ${index + 2}`}
                      className="rounded"
                      style={{ maxWidth: "120px" }}
                    />
                  )}
                </a>
              </figure>
            ))}
          </div>
        )}
      </div>
    );
  }

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
          <SwiperSlide key={`slide-${product?.id}-${index}`}>
            {isValidVideoExtension(image) ? (
              <video
                className="blurde_bg"
                src={image}
                ref={index === 0 ? videoRef : null}
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
                  ref={index === 0 ? videoRef : null}
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
