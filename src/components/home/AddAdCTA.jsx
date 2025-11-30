"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModal } from "@/stores/useAuthModal";

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
    <section className="add-ad-cta">
      <div className="container">
        <div className="cta-content">
          <div className="cta-text">
            <h2>{t("addAdCTA.title") || "أضف إعلانك الآن!"}</h2>
            <p>
              {t("addAdCTA.subtitle") || 
                "انشر إعلانك مجاناً وابدأ في الوصول لآلاف العملاء المحتملين في منطقتك"}
            </p>
          </div>
          <Link
            href={getAddAdLink() || "/"}
            className="cta-button"
            onClick={handleClick}
          >
            <i className="fa-light fa-plus"></i>
            {t("addAdCTA.button") || "أضف إعلانك"}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .add-ad-cta {
          padding: 48px 0;
          background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
          position: relative;
          overflow: hidden;
        }

        .add-ad-cta::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .add-ad-cta::after {
          content: "";
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .cta-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .cta-content {
            flex-direction: column;
            text-align: center;
          }
        }

        .cta-text h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
        }

        .cta-text p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          max-width: 500px;
        }

        @media (max-width: 768px) {
          .cta-text h2 {
            font-size: 24px;
          }

          .cta-text p {
            font-size: 14px;
          }
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: #fff;
          color: #1abc9c;
          font-size: 16px;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .cta-button:hover {
          background: #0d0d0d;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 576px) {
          .cta-button {
            padding: 14px 28px;
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}
