"use client"; // Error boundaries must be Client Components

import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import { useTranslations } from "use-intl";

export default function Error({ error, reset }) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="error-section">
      <img src="/icons/error.svg" alt="error image" />
      <h2>{t("error.pageNotFound")}</h2>
      <Link aria-label="Home" to="/" className="backhome">
        <i className="fa-solid fa-home"></i>
        <span>{t("error.goHome")}</span>
      </Link>
    </section>
  );
}
