import { getUserType } from "@/services/auth/getUserType";
import { getCategories } from "@/services/categories/getCategories";
import { getSubCategories } from "@/services/categories/getSubCategories";
import { getCountries } from "@/services/getCountries";
import { getTranslations } from "next-intl/server";
import AdvancedFilter from "./AdvancedFilter";
import CategoriesSlider from "./CategoriesSlider";
import SubCategoriesSlider from "./SubCategoriesSlider";
import { getLocale } from "next-intl/server";

export default async function FilterSection({
  selectedCategory,
  selectedSubCategory = null,
}) {
  const countries = await getCountries();
  const t = await getTranslations();
  const user = await getUserType();
  const categories = await getCategories(`/${user}/categories`);
  const locale = await getLocale();
  const [selectedCountrySlug, selectedLang] = locale.split("-");

  let subCategories = [];
  if (selectedCategory) {
    try {
      subCategories = await getSubCategories(
        {
          category_slug: selectedCategory,
        },
        `/${user}/sub-categories`
      );
    } catch {
      // Silently handle invalid category slugs
      subCategories = [];
    }
  }

  return (
    <section className="explore_ads">
      <div className="container d-flex flex-column gap-2">
        <div className="js-only">
          <CategoriesSlider categories={categories} />
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
                      className={`category sub ${
                        !selectedSubCategory ? "active" : ""
                      }`}
                    >
                      <h6>{t("all")}</h6>
                    </a>
                  </div>
                  {subCategories.map((sub) => (
                    <div key={sub.id} className="swiper-slide">
                      <a
                        href={`/${selectedCategory}/${sub.slug}`}
                        className={`category sub ${
                          selectedSubCategory === sub.slug ? "active" : ""
                        }`}
                      >
                        <h6>{sub.name}</h6>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="filter mt-3">
              <div className="selects">
                {/* Country Filter - native dropdown via <details>/<summary> for no-JS */}
                <details className="country-dropdown no-js my-2 position-relative">
                  <summary
                    style={{ height: "40px" }}
                    className="btn btn-light border px-3 py-2 d-flex align-items-center gap-2"
                  >
                    {(() => {
                      const current = countries.find(
                        (c) => c.iso_code === selectedCountrySlug
                      );
                      return (
                        <>
                          <img
                            src={
                              current ? `${current.image}` : "/icons/lang.svg"
                            }
                            alt={current ? current.name : "country"}
                            style={{ width: 20 }}
                          />
                          <span>{current ? current.name : "Country"}</span>
                          <i className="fa-solid fa-angle-down"></i>
                        </>
                      );
                    })()}
                  </summary>
                  <ul
                    className="list-unstyled m-0 p-2 border bg-white position-absolute  z-3  "
                    style={{ top: "42px", width: "100%" }}
                  >
                    {countries.map((country) => {
                      const newLocale = `${country.iso_code}-${selectedLang}`;
                      const currentPath = selectedCategory
                        ? selectedSubCategory
                          ? `/${selectedCategory}/${selectedSubCategory}`
                          : `/${selectedCategory}`
                        : "";
                      return (
                        <li
                          key={country.iso_code}
                          className="my-1"
                          style={{ color: "#000", padding: "8px" }}
                        >
                          <a
                            href={`/${newLocale}${currentPath}`}
                            className={`d-flex align-items-center gap-2 ${
                              selectedCountrySlug === country.iso_code
                                ? "fw-bold"
                                : ""
                            }`}
                          >
                            <img
                              src={`${country.image}`}
                              alt={country.name}
                              style={{ width: 20 }}
                            />
                            <span style={{ color: "#000" }}>
                              {country.name}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </noscript>
      </div>
    </section>
  );
}
