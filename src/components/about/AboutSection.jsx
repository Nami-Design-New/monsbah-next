import { getTranslations } from "next-intl/server";

export default async function AboutSection() {
  const t = await getTranslations("about");

  return (
    <div className="heading-section">
      <div className="image-wrapper">
        <img src="/auth-benner.png" alt="Monsbah" layout="responsive" />
      </div>
      <div className="info-wrapper">
        <h1 className="h3">
          {t("title")} <span>{t("appName")}</span>
        </h1>
        <p>{t("desc")}</p>
      </div>
    </div>
  );
}
