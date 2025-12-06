"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModal } from "@/stores/useAuthModal";
import styles from "./AddAdCTA.module.css";

/**
 * AddAdCTA - قسم أضف إعلانك
 * CTA section بخلفية مميزة وزر واضح
 */
export default function AddAdCTA() {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user);
  const { userType } = useAuthModal((state) => state);
  const handleShowAuthModal = useAuthModal((state) => state.onOpen);

  const getAddAdLink = () => {
    if (!user) return null;
    return userType === "company" ? "/add-company-product" : "/profile/addAd";
  };

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      handleShowAuthModal();
    }
  };

  return (
    <section className={styles.addAdCta}>
      <div className="container">
        <div className={styles.ctaContent}>
          <div className={styles.ctaText}>
            <h2>{t("addAdCTA.title") || "أضف إعلانك الآن!"}</h2>
            <p>
              {t("addAdCTA.subtitle") || 
                "انشر إعلانك مجاناً وابدأ في الوصول لآلاف العملاء المحتملين في منطقتك"}
            </p>
          </div>
          <Link
            href={getAddAdLink() || "/"}
            className={styles.ctaButton}
            onClick={handleClick}
          >
            <i className="fa-light fa-plus"></i>
            {t("addAdCTA.button") || "أضف إعلانك"}
          </Link>
        </div>
      </div>
    </section>
  );
}
