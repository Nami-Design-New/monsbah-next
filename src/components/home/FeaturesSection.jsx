"use client";

import { useTranslations } from "next-intl";

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
    <section className="features-section">
      <div className="container">
        <div className="section-header">
          <h2>{t("features.title") || "مميزات المنصة"}</h2>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features-section {
          padding: 48px 0;
          background: #fff;
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

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 992px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .features-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .feature-card {
          text-align: center;
          padding: 24px;
          background: #f8f8f8;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          background: #fff;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-icon i {
          font-size: 28px;
          color: #fff;
        }

        .feature-title {
          font-size: 16px;
          font-weight: 700;
          color: #0d0d0d;
          margin: 0 0 8px;
        }

        .feature-description {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 576px) {
          .feature-card {
            padding: 20px;
          }

          .feature-icon {
            width: 56px;
            height: 56px;
          }

          .feature-icon i {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
}
