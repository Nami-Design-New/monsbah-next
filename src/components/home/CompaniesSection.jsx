"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import styles from "./CompaniesSection.module.css";

export default function CompaniesSection({ categories = [] }) {
  const t = useTranslations();

  if (!categories?.length) return null;
  
  return (
    <section className={styles.companiesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{t("companiesSection") || "قسم الشركات"}</h2>
          <Link href="/companies" className={styles.viewAllBtn}>
            {t("viewAll") || "عرض الكل"}
            <i className="fa-light fa-arrow-left"></i>
          </Link>
        </div>

        <div className={styles.companiesGrid}>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id || category.slug}
              href={`/companies?category=${category.slug}`}
              className={styles.companyCard}
            >
              <div className={styles.cardImage}>
                <Image
                  src={category.image || "/banner.webp"}
                  alt={category.alt || category.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardContent}>
                    <span className={styles.cardName}>{category.name}</span>
                    {/* {category.meta_description && ( */}
                      <p className={styles.cardDescription}>{category.meta_description}</p>
                    {/* )} */}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
