"use client";

import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";
import styles from "./TestimonialsSection.module.css";

/**
 * TestimonialsSection - آراء العملاء
 * عرض 3-4 بطاقات تقييم مع Slider
 */
export default function TestimonialsSection({ testimonials = [] }) {
  const t = useTranslations();

  // Default testimonials if none provided from API
  const defaultTestimonials = [
    {
      id: 1,
      name: "سارة محمد",
      image: "/icons/user_default.png",
      rating: 5,
      text: "تجربة رائعة! تمكنت من بيع فساتيني بسهولة وسرعة. المنصة سهلة الاستخدام والتواصل مع العملاء ممتاز.",
      company: null
    },
    {
      id: 2,
      name: "نورة أحمد",
      image: "/icons/user_default.png",
      rating: 5,
      text: "أفضل منصة لبيع وشراء الملابس والإكسسوارات. وجدت كل ما أحتاجه بأسعار مناسبة.",
      company: null
    },
    {
      id: 3,
      name: "فاطمة علي",
      image: "/icons/user_default.png",
      rating: 4,
      text: "منصة ممتازة وخدمة عملاء رائعة. أنصح الجميع بتجربتها.",
      company: null
    },
    {
      id: 4,
      name: "صالون الجمال",
      image: "/icons/user_default.png",
      rating: 5,
      text: "كشركة، ساعدتنا المنصة في الوصول لعملاء جدد وزيادة مبيعاتنا بشكل ملحوظ.",
      company: "صالون الجمال"
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-${i < rating ? "solid" : "light"} fa-star`}
        style={{ color: i < rating ? "#ffc107" : "#e0e0e0" }}
      ></i>
    ));
  };

  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{t("testimonials.title") || "آراء العملاء"}</h2>
        </div>

        <div className={styles.testimonialsCarousel}>
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1}
            spaceBetween={24}
            navigation={{
              nextEl: ".testimonial-next",
              prevEl: ".testimonial-prev",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="testimonials-swiper"
          >
            {displayTestimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialHeader}>
                    <div className={styles.userImage}>
                      <Image
                        src={testimonial.image || "/icons/user_default.png"}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <strong className={styles.userName}>{testimonial.name}</strong>
                      {testimonial.company && (
                        <span className={styles.userCompany}>{testimonial.company}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.testimonialRating}>
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className={styles.testimonialText}>{testimonial.text}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button className={`${styles.swiperNavBtn} ${styles.testimonialPrev} testimonial-prev`}>
            <i className="fa-light fa-chevron-right"></i>
          </button>
          <button className={`${styles.swiperNavBtn} ${styles.testimonialNext} testimonial-next`}>
            <i className="fa-light fa-chevron-left"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
