"use client";

import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";

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
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>{t("testimonials.title") || "آراء العملاء"}</h2>
        </div>

        <div className="testimonials-carousel">
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
                <div className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="user-image">
                      <Image
                        src={testimonial.image || "/icons/user_default.png"}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                      />
                    </div>
                    <div className="user-info">
                      <h4 className="user-name">{testimonial.name}</h4>
                      {testimonial.company && (
                        <span className="user-company">{testimonial.company}</span>
                      )}
                    </div>
                  </div>
                  <div className="testimonial-rating">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="testimonial-text">{testimonial.text}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button className="swiper-nav-btn testimonial-prev">
            <i className="fa-light fa-chevron-right"></i>
          </button>
          <button className="swiper-nav-btn testimonial-next">
            <i className="fa-light fa-chevron-left"></i>
          </button>
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          padding: 48px 0;
          background: #f8f8f8;
        }

        .section-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0d0d0d;
          margin: 0;
        }

        .testimonials-carousel {
          position: relative;
          padding: 0 48px;
        }

        @media (max-width: 768px) {
          .testimonials-carousel {
            padding: 0;
          }
        }

        :global(.testimonials-swiper) {
          padding: 8px;
        }

        .testimonial-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          height: 100%;
          transition: all 0.3s ease;
        }

        .testimonial-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .user-image {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid #1abc9c;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 16px;
          font-weight: 700;
          color: #0d0d0d;
          margin: 0 0 4px;
        }

        .user-company {
          font-size: 12px;
          color: #1abc9c;
        }

        .testimonial-rating {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }

        .testimonial-rating i {
          font-size: 14px;
        }

        .testimonial-text {
          font-size: 14px;
          color: #666;
          line-height: 1.7;
          margin: 0;
        }

        .swiper-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
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

        :global(.testimonial-prev) {
          right: 0;
        }

        :global(.testimonial-next) {
          left: 0;
        }

        @media (max-width: 768px) {
          .swiper-nav-btn {
            display: none;
          }

          .testimonial-card {
            padding: 20px;
          }
        }
      `}</style>
    </section>
  );
}
