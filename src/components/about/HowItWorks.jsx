import { getTranslations } from "next-intl/server";

export default async function HowItWorks() {
  const t = await getTranslations("about");

  return (
    <div className="how-it-works">
      <h3>{t("howItWorks")}</h3>
      <div className="steps-wrapper">
        <div className="col-lg-4  col-12 p-3">
          <div className="step ">
            <div className="step-header">
              <h2>01</h2>
              <span className="header-line"></span>
            </div>
            <div className="info-wrapper">
              <h4>{t("step1")}</h4>
              <p>{t("step1Desc")}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-4  col-12 p-3">
          <div className="step ">
            <div className="step-header">
              <h2>02</h2>
              <span className="header-line"></span>
            </div>
            <div className="info-wrapper">
              <h4>{t("step2")}</h4>
              <p>{t("step2Desc")}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-4  col-12 p-3">
          <div className="step ">
            <div className="step-header">
              <h2>03</h2>
              <span className="header-line"></span>
            </div>
            <div className="info-wrapper">
              <h4>{t("step3")}</h4>
              <p>{t("step3Desc")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
