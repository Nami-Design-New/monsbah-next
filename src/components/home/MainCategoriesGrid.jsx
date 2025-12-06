"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import styles from "./MainCategoriesGrid.module.css";

/**
 * MainCategoriesGrid - الأقسام الأساسية
 * عرض الكاتيجوريز بشكل بطاقات كبيرة (4 أعمدة ديسكتوب / 2 موبايل)
 */
export default function MainCategoriesGrid({ categories = [] }) {
  const t = useTranslations();

  if (!categories?.length) return null;

  return (
    <section className={styles.mainCategoriesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{t("mainCategories") || "الأقسام الأساسية"}</h2>
        </div>
        <div className={styles.categoriesGrid}>
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id || category.slug}
              href={`/${category.slug}`}
              className={styles.categoryCard}
              aria-label={category.name}
            >
              <div className={styles.cardIcon}>
                <Image
                  src={category.icon || category.image || "/icons/all.svg"}
                  alt={category.alt || category.name}
                  width={48}
                  height={48}
                  loading="lazy"
                />
              </div>
              <span className={styles.cardName}>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
