import { getTranslations } from "next-intl/server";
import React from "react";
import { generateHreflangAlternates } from "@/utils/hreflang";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/terms-and-conditions");
  return {
    title: t("terms.title"),
    description: t("terms.description"),
    alternates,
  };
}

export default async function Page() {
  const t = await getTranslations();
  return (
    <section className="terms_section">
      <div className="terms_content container">
        <h1>{t("TermsConditions")}</h1>
        <p>{t("Conditions1")}</p>
        <p>{t("Conditions2")}</p>
        <p>{t("Conditions3")}</p>
        <p>{t("Conditions4")}</p>
        <p>{t("Conditions5")}</p>
        <p>{t("Conditions6")}</p>
        <p>{t("Conditions7")}</p>
        <p>{t("Conditions8")}</p>

        <p>{t("Conditions9")}</p>

        <p>{t("Conditions10")}</p>
        <p>{t("Conditions11")}</p>
        <p>{t("Conditions12")}</p>

        <p>{t("Conditions13")}</p>

        <p>{t("Conditions14")}</p>

        <p>{t("Conditions15")}</p>
        <p>{t("Conditions16")}</p>

        <p>{t("Conditions17")}</p>

        <p>{t("Conditions18")}</p>

        <p>{t("Conditions19")}</p>

        <p>{t("Conditions20")}</p>

        <p>{t("Conditions21")}</p>

        <p>{t("Conditions22")}</p>

        <p>{t("Conditions23")}</p>

        <p>{t("Conditions24")}</p>
      </div>
    </section>
  );
}
