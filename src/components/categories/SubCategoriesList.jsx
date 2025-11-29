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
                <div className="image-wrapper">
                  <Image
                    fill={true}
                    src={category?.image || category?.icon}
                    alt={category?.alt || category?.name}
                
                  />
                </div>
                <h2 className="category-name">{category?.name}</h2>
              </Link>
            </div>
          );
        })}

        {/* Companies Categories Section */}
        {companiesCategories && companiesCategories.length > 0 && (
          <>
            {companiesCategories.map((category) => {
              return (
                <div className="col-xl-3 col-md-4 col-6 p-1" key={category.id}>
                  <Link
                    aria-label={category.name}
                    href={`/companies?category=${category.slug}`}
                    className="category sub d-flex align-items-center flex-column gap-2"
                  >
                    <div className="image-wrapper">
                      <Image
                        fill={true}
                        src={category?.image || category?.icon}
                        alt={category?.alt || category?.name}
                       
                      />
                    </div>
                    <h2 className="category-name">{category?.name}</h2>
                  </Link>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Responsive CSS in same file */}
      <style>{`
        .image-wrapper {
          position: relative;
          width: 100%;
          height: 200px; /* Default for desktop */
        }

        @media (max-width: 768px) {
          .image-wrapper {
            height: 100px; /* Mobile height */
          }
        }
      `}</style>
    </div>
  );
}
