"use client"; // Error boundaries must be Client Components

import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import { useTranslations, useLocale } from "use-intl";

export default function Error({ error, reset }) {
  const t = useTranslations("error");
  const locale = useLocale();

  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <section className="error-section">
      <div style={{ fontSize: "120px", marginBottom: "1rem" }}>⚠️</div>
      <h2>{t("serverErrorTitle")}</h2>
      <p style={{ maxWidth: 520, textAlign: "center", margin: "0 auto 1rem" }}>
        {t("serverErrorDescription")}
      </p>
      <p style={{ maxWidth: 520, textAlign: "center", margin: "0 auto 1.5rem", fontStyle: "italic", opacity: 0.8 }}>
        {t("apologyMessage")}
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
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
      
      {/* Additional helpful links */}
      {/* <div className="error-links" style={{ 
        display: "flex", 
        gap: "1rem", 
        justifyContent: "center", 
        flexWrap: "wrap",
        paddingTop: "1rem",
        borderTop: "1px solid #dee2e6",
        maxWidth: "520px",
        margin: "0 auto"
      }}>
        <Link href="/categories" aria-label="Browse categories" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
          {t("browseCategories")}
        </Link>
        <span style={{ color: "#dee2e6" }}>•</span>
        <Link href="/companies" aria-label="Browse companies" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
          {t("browseCompanies")}
        </Link>
        <span style={{ color: "#dee2e6" }}>•</span>
        <Link href="/contact" aria-label="Contact us" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
          {t("contactUs")}
        </Link>
      </div> */}
    </section>
  );
}
