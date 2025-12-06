"use client";

import Image from "next/image";
import styles from "./MobileAppSection.module.css";

export default function MobileAppSection() {
  return (
    <section className={styles.mobileSection}>
      <div className="container">
        <div className={styles.wrapper}>
          {/* Phone Mockup */}
          <div className={styles.phoneContainer}>
            <div className={styles.phoneMockup}>
              {/* <div className={styles.phoneScreen}> */}
                <Image
                  src='/MocapMobile.webp'
                  alt="تطبيق منصبة"
                  fill
                  sizes="300px"
                  style={{ objectFit: "cover" }}
                />
              {/* </div> */}
            </div>
            {/* Decorative elements */}
            <div className={styles.decorCircle1}></div>
            <div className={styles.decorCircle2}></div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <span className={styles.badge}>📱 التطبيق متاح الآن</span>
            <h2 className={styles.title}>
              حمّل تطبيق منصبة
              <br />
              <span className={styles.highlight}>وتسوّق بسهولة</span>
            </h2>
            <p className={styles.description}>
              استمتع بتجربة تسوق مميزة من خلال تطبيقنا. تصفح آلاف المنتجات، 
              احصل على إشعارات فورية بأحدث العروض، وتواصل مع البائعين مباشرة.
            </p>

            <ul className={styles.features}>
              <li>
                <span className={styles.featureIcon}>✓</span>
                تصفح سهل وسريع
              </li>
              <li>
                <span className={styles.featureIcon}>✓</span>
                إشعارات بأحدث العروض
              </li>
              <li>
                <span className={styles.featureIcon}>✓</span>
                دردشة مباشرة مع البائعين
              </li>
              <li>
                <span className={styles.featureIcon}>✓</span>
                حفظ المنتجات المفضلة
              </li>
            </ul>

            <div className={styles.storeButtons}>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBtn}
              >
                <Image
                  src="/icons/appStore.svg"
                  alt="App Store"
                  width={140}
                  height={42}
                  unoptimized
                />
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBtn}
              >
                <Image
                  src="/icons/playStore.svg"
                  alt="Google Play"
                  width={140}
                  height={42}
                  unoptimized
                />
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
