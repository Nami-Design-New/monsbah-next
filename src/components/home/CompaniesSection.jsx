"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

/**
 * CompaniesSection - قسم الشركات
 * عرض كاتيجوريز الشركات بشكل كاردات مع صور
 */
export default function CompaniesSection({ categories = [] }) {
  const t = useTranslations();

  if (!categories?.length) return null;

  return (
    <section className="companies-section">
      <div className="container">
        <div className="section-header">
          <h2>{t("companiesSection") || "قسم الشركات"}</h2>
          <Link href="/companies" className="view-all-btn">
            {t("viewAll") || "عرض الكل"}
            <i className="fa-light fa-arrow-left"></i>
          </Link>
        </div>

        <div className="companies-grid">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id || category.slug}
              href={`/companies?category=${category.slug}`}
              className="company-card"
            >
              <div className="card-image">
                <Image
                  src={category.image || "/banner.webp"}
                  alt={category.alt || category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
                <div className="card-overlay">
                  <span className="card-name">{category.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .companies-section {
          padding: 40px 0;
          background: #f8f8f8;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: #0d0d0d;
          margin: 0;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1abc9c;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          color: #16a085;
          gap: 12px;
        }

        .companies-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 992px) {
          .companies-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .companies-grid {
            gap: 12px;
          }
        }

        .company-card {
          display: block;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .company-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%);
          display: flex;
          align-items: flex-end;
          padding: 16px;
        }

        .card-name {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }

        @media (max-width: 576px) {
          .card-name {
            font-size: 14px;
          }

          .card-overlay {
            padding: 12px;
          }
        }
      `}</style>
    </section>
  );
}
