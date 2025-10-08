import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function CategoriesSection({ categories }) {
  const t = await getTranslations();
  return (
    <section className="categories-page">
      <div className="sections">
        <div className="container">
          <div className="mb-4">
            <h2 className="company-category-head">{t("companySec")}</h2>
          </div>

          <div className="parent">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/companies?category=${category.id}`}
              >
                <div className="category-card">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />
                  <h2>{category.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
