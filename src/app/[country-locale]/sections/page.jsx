import { Link } from "@/i18n/navigation";
import { getCompaniesCategories } from "@/services/categories/getCompaniesCategories";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import React from "react";
import { generateHreflangAlternates } from "@/utils/hreflang";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/sections");

  return {
    title: t("companyCategories.title"),
    description: t("companyCategories.description"),
    alternates,
  };
}

export default async function page() {
  const t = await getTranslations();
  const categories = await getCompaniesCategories();

  return (
    <section className="categories-page">
      <div className="sections">
        <div className="container">
          <div className="mb-4">
            <h2 className="company-category-head">{t("companySec")}</h2>
          </div>{" "}
          <div className="parent ">
            {categories.map((category) => (
              <Link
                key={category?.id}
                href={`/companies?category=${category?.slug}`}
              >
                <div className="category-card ">
                  <div className="position-relative h-100">
                    <Image
                      fill={true}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={category?.image}
                      alt={category?.name}
                    />
                    <h2>{category?.name}</h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
