import { getTranslations } from "next-intl/server";

export default async function AboutSection() {
  const t = await getTranslations("about");

  return (
    <>
      <div className="heading-section">
        <div className="image-wrapper">
          <img src="/auth-benner.webp" alt="Monsbah" layout="responsive" />
        </div>
        <div className="info-wrapper">
          <h1 className="h3">
            {t("title")} <span>"{t("appName")}"</span>؟
          </h1>
          <p>{t("desc")}</p>
        </div>
      </div>

      <div className="why-section">
        <h2 className="h4 mb-4">{t("whyTitle")}</h2>
        <ul className="why-list">
          <li>{t("whyPoint1")}</li>
          <li>{t("whyPoint2")}</li>
          <li>{t("whyPoint3")}</li>
          <li>{t("whyPoint4")}</li>
          <li>{t("whyPoint5")}</li>
        </ul>
      </div>
    </>
  );
}
