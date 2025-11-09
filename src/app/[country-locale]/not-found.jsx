import { Link } from "@/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("error");
  const locale = await getLocale();

  return (
    <section className="error-section">
      <img src="/icons/error.svg" alt={t("notFoundTitle")} />
      <h2>{t("notFoundTitle")}</h2>
      <p style={{ maxWidth: 520, textAlign: "center", margin: "0 auto 1.5rem" }}>
        {t("pageNotFound")}
      </p>
      
      <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
        <Link aria-label="Home" href="/" locale={locale} className="backhome">
          <i className="fa-solid fa-home" aria-hidden="true" />
          <span>{t("goHome")}</span>
        </Link>
      </div>
      
      {/* Additional helpful links */}
      <div className="error-links" style={{ 
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
      </div>
    </section>
  );
}
