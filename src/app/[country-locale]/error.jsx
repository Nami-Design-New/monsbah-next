"use client"; // Error boundaries must be Client Components

import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import { useTranslations, useLocale } from "use-intl";

export default function Error({ error, reset }) {
  const t = useTranslations("error");
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="error-section">
      <img src="/icons/error.svg" alt={t("serverErrorTitle")} />
      <h2>{t("serverErrorTitle")}</h2>
      <p style={{ maxWidth: 420, textAlign: "center", margin: "0 auto 1.5rem" }}>
        {t("serverErrorDescription")}
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        <button
          type="button"
          onClick={() => reset()}
          className="backhome"
          style={{ border: "none" }}
        >
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />
          <span>{t("tryAgain")}</span>
        </button>
        <Link aria-label="Home" href="/" locale={locale} className="backhome">
          <i className="fa-solid fa-home" aria-hidden="true" />
          <span>{t("goHome")}</span>
        </Link>
      </div>
    </section>
  );
}
