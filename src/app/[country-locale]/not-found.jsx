import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("error");

  return (
    <section className="error-section">
      <img src="/icons/error.svg" alt={t("pageNotFound")} />
      <h2>404</h2>
      <p style={{ maxWidth: 420, textAlign: "center", margin: "0 auto 1.5rem" }}>
        {t("pageNotFound")}
      </p>
      <Link aria-label="Home" to="/" className="backhome">
        <i className="fa-solid fa-home" aria-hidden="true" />
        <span>{t("goHome")}</span>
      </Link>
    </section>
  );
}
