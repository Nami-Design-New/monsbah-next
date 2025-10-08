import { getCategories } from "@/services/categories/getCategories";
import { getSubCategories } from "@/services/categories/getSubCategories";
import { getCountries } from "@/services/getCountries";
import CompanyPageCategoriesSlider from "../companies/CompanyPageCategoriesSlider";
import SubCategoriesCompanySlider from "../companies/SubCategoriesCompanySlider";
import AdvancedFilter from "./AdvancedFilter";

export default async function FilterCompanySection({ selectedCategory }) {
  const [countries, categories] = await Promise.all([
    getCountries(),
    getCategories(`/company/categories`),
  ]);

  let subCategories = [];
  if (selectedCategory) {
    try {
      subCategories = await getSubCategories(
        {
          category_slug: selectedCategory,
        },
        `/company/sub-categories`
      );
    } catch {
      // Silently handle invalid category slugs
      subCategories = [];
    }
  }

  return (
    <section className="explore_ads">
      <div className="container d-flex flex-column gap-2">
        <CompanyPageCategoriesSlider categories={categories} />
        {selectedCategory && (
          <SubCategoriesCompanySlider subCategories={subCategories} />
        )}
        <AdvancedFilter
          countries={countries}
          selectedCategory={selectedCategory}
        />
      </div>
    </section>
  );
}
