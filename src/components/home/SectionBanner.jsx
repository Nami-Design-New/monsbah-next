"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import styles from "./SectionBanner.module.css";

const banners = [
  {
    id: 1,
    image: "/banner.webp",
    title: "عروض حصرية",
    subtitle: "خصومات تصل إلى 50%",
    link: "/offers",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    id: 2,
    image: "/banner.webp",
    title: "منتجات مميزة",
    subtitle: "اكتشف الجديد",
    link: "/featured",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    id: 3,
    image: "/banner.webp",
    title: "أفضل الأسعار",
    subtitle: "ضمان أقل سعر",
    link: "/best-prices",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    id: 4,
    image: "/banner.webp",
    title: "شحن مجاني",
    subtitle: "على جميع الطلبات",
    link: "/free-shipping",
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
];

export default function SectionBanner({ index = 0 }) {
  const banner = banners[index % banners.length];
  
  return (
    <section className={styles.bannerSection}>
      <div className="container">
        <Link href={banner.link} className={styles.bannerCard} style={{ background: banner.color }}>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>{banner.title}</h3>
            <p className={styles.bannerSubtitle}>{banner.subtitle}</p>
            <span className={styles.bannerBtn}>تسوق الآن</span>
          </div>
          <div className={styles.bannerImage}>
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              sizes="(max-width: 768px) 40vw, 300px"
              style={{ objectFit: "contain" }}
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
