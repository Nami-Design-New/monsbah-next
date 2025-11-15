import { Link } from "@/i18n/navigation";
import { getCategories } from "@/services/categories/getCategories";
import { getCompaniesCategories } from "@/services/categories/getCompaniesCategories";
import Image from "next/image";

export default async function SubCategoriesList({
  selectedCategory: _selectedCategory,
  categories: _categories,
}) {
  // Fetch both regular categories and company categories
  const [regularCategories, companiesCategories] = await Promise.all([
    getCategories(),
    getCompaniesCategories(),
  ]);

  return (
    <div className="col-lg-10 col-md-9 col-8 p-lg-2 p-1">
      <div className="categories_slider subcategories_slider">
        {/* Regular Categories */}
        {regularCategories?.map((category, index) => {
          const totalCategories = regularCategories.length;
          
          // Determine if this category should take full width
          let shouldTakeFullWidth = false;
          if (totalCategories >= 5) {
            // If 5 or more categories, last (totalCategories - 4) items take full width
            shouldTakeFullWidth = index >= 4;
          }
          
          const colClass = shouldTakeFullWidth ? "col-12" : "col-xl-3 col-md-4 col-6";
          
          return (
            <div className={`${colClass} p-1`} key={category.id}>
              <Link
                aria-label={category.name}
                href={`${category.slug}`}
                className="category sub d-flex align-items-center flex-column gap-2"
              >
                <div className="image-wrapper" style={{ height: "200px", width: "100%" , position: "relative" }}>
                  <Image fill={true} src={category?.image || category?.icon} alt={category?.alt || category?.name} />
                </div>
                <h6>{category?.name}</h6>
              </Link>
            </div>
          );
        })}

        {/* Companies Categories Section */}
        {companiesCategories && companiesCategories.length > 0 && (
          <>
        
            {/* Company Categories */}
            {companiesCategories.map((category) => {
              return (
                <div className="col-xl-3 col-md-4 col-6 p-1" key={category.id}>
                  <Link
                    aria-label={category.name}
                    href={`/companies?category=${category.slug}`}
                    className="category sub d-flex align-items-center flex-column gap-2"
                  >
                    <div className="image-wrapper" style={{ height: "200px", position: "relative" }}>
                      <Image fill={true} src={category?.image || category?.icon} alt={category?.alt || category?.name} />
                    </div>
                    <h6>{category?.name}</h6>
                  </Link>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
