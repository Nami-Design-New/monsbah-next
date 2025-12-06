"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import  "./CompaniesSection.css";

export default function CompaniesSection({ categories = [] }) {
  const t = useTranslations();

  if (!categories?.length) return null;

  return (
    <section className="companiesSection">
      <div className="container">
        <div className="sectionHeader">
          <h2>{t("companiesSection") || "قسم الشركات"}</h2>
          <Link href="/companies" className="viewAllBtn">
            {t("viewAll") || "عرض الكل"}
            <i className="fa-light fa-arrow-left"></i>
          </Link>
        </div>

        <div className="companiesGrid">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id || category.slug}
              href={`/companies?category=${category.slug}`}
              className="companyCard"
            >
              <div className="cardImage">
                <Image
                  src={category.image || "/banner.webp"}
                  alt={category.alt || category.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className="cardOverlay">
                  <span className="cardName">{category.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
