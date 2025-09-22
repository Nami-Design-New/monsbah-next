import { getUserType } from "@/services/auth/getUserType";
import { getCategories } from "@/services/categories/getCategories";
import { getSubCategories } from "@/services/categories/getSubCategories";
import { getCountries } from "@/services/getCountries";
import { getTranslations } from "next-intl/server";
import AdvancedFilter from "./AdvancedFilter";
import CategoriesSlider from "./CategoriesSlider";
import SubCategoriesSlider from "./SubCategoriesSlider";

export default async function FilterSection({ selectedCategory, selectedSubCategory = null }) {
  const countries = await getCountries();
  const t = await getTranslations();
  const user = await getUserType();
  const categories = await getCategories(`/${user}/categories`);

  const subCategories = selectedCategory
    ? await getSubCategories(
        {
          category_slug: selectedCategory,
        },
        `/${user}/sub-categories`
      )
    : [];

  return (
    <section className="explore_ads">
      <div className="container d-flex flex-column gap-2">
        <div className="js-only"><CategoriesSlider categories={categories} />
        {selectedCategory && (
          <SubCategoriesSlider subCategories={subCategories} />
        )}
        <AdvancedFilter
          countries={countries}
          selectedCategory={selectedCategory}
        />
        </div>

        {/* Fallback UI when JavaScript is disabled */}
        <noscript>
          <style>{`.js-only{display:none !important;}`}</style>
          <div className="no-js-filters">
            {/* Categories */}
            <div className="categories_slider no-js swiper">
              <div className="swiper-wrapper d-flex gap-2 overflow-auto p-1">
                <div className="swiper-slide">
                  <a
                    href="/"
                    className={`category ${!selectedCategory ? "active" : ""}`}
                  >
                    <div className="img">
                      <img src="/icons/all.svg" alt="All Categories" />
                    </div>
                    <h6>{t("all")}</h6>
                  </a>
                </div>
                {categories.map((cat) => (
                  <div key={cat.slug} className="swiper-slide">
                    <a
                      href={`/${cat.slug}`}
                      className={`category ${
                        selectedCategory === cat.slug ? "active" : ""
                      }`}
                      aria-label={`Category ${cat.slug}`}
                    >
                      <div className="img">
                        <img src={cat.image} alt={cat.slug} />
                      </div>
                      <h6>{cat.name}</h6>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* SubCategories */}
            {subCategories?.length > 0 && (
              <div className="categories_slider no-js swiper mt-2">
                <div className="swiper-wrapper d-flex gap-2 overflow-auto p-1">
                  <div className="swiper-slide">
                    <a
                      href={`/${selectedCategory}`}
                      className={`category sub ${!selectedSubCategory ? "active" : ""}`}
                    >
                      <h6>{t("all")}</h6>
                    </a>
                  </div>
                  {subCategories.map((sub) => (
                    <div key={sub.id} className="swiper-slide">
                      <a
                        href={`/${selectedCategory}/${sub.slug}`}
                        className={`category sub ${selectedSubCategory === sub.slug ? "active" : ""}`}
                      >
                        <h6>{sub.name}</h6>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </noscript>
      </div>
    </section>
  );
}
