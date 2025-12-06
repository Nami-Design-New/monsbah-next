"use client";

import { useTranslations } from "next-intl";
import styles from "./FeaturesSection.module.css";

/**
 * FeaturesSection - مميزات المنصة
 * عرض أبرز الفوائد بشكل أيقونات ونصوص
 */
export default function FeaturesSection() {
  const t = useTranslations();

  const features = [
    {
      id: 1,
      icon: "fa-light fa-mobile-screen",
      title: t("features.easyToUse") || "سهولة الاستخدام",
      description: t("features.easyToUseDesc") || "واجهة بسيطة وسهلة للجميع"
    },
    {
      id: 2,
      icon: "fa-light fa-headset",
      title: t("features.support247") || "دعم فني 24/7",
      description: t("features.support247Desc") || "فريق دعم متاح على مدار الساعة"
    },
    {
      id: 3,
      icon: "fa-light fa-rocket",
      title: t("features.fastPublish") || "سرعة نشر الإعلان",
      description: t("features.fastPublishDesc") || "انشر إعلانك في دقائق"
    },
    {
      id: 4,
      icon: "fa-light fa-mobile",
      title: t("features.mobileApp") || "تطبيق متوفر على الجوال",
      description: t("features.mobileAppDesc") || "حمّل التطبيق للأندرويد والآيفون"
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{t("features.title") || "مميزات المنصة"}</h2>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className={feature.icon}></i>
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
