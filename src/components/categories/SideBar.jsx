import { Link } from "@/i18n/navigation";
import { getCategories } from "@/services/categories/getCategories";
import { getCompaniesCategories } from "@/services/categories/getCompaniesCategories";
import Image from "next/image";

export default async function SideBar({ selectedCategory }) {
  const [categoryList, companiesCategories] = await Promise.all([
    getCategories(),
    getCompaniesCategories(),
  ]);

  return (
    <div
      className="col-lg-2 col-md-3 col-4 p-lg-2 p-1 sidebar-sticky-wrapper"
      style={{
        position: "sticky",
        top: "0px",
        alignSelf: "flex-start",
        maxHeight: "calc(100vh)",
        overflowY: "auto",
        zIndex: 5,
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="categories_sidebar">
        <Link
          aria-label="All Categories"
          href="/categories"
          className={`category ${selectedCategory === null ? "active" : ""}`}
        >
          <div className="img">
            <Image width={32} height={32} src="/icons/all.svg" alt="all" />
          </div>
          <p className="category-name">All</p>
        </Link>

        {categoryList.map((category) => (
          <Link
            key={category.id}
            href={`/${category.slug}`}
            className={`category ${
              category.slug === selectedCategory ? "active" : ""
            }`}
            aria-label={category.name}
          >
            <div className="img">
              <img src={category.icon} alt={category.alt || category.name} />
            </div>
            <p className="category-name">{category.name}</p>
          </Link>
        ))}

        {/* Companies Categories Section */}
        {companiesCategories && companiesCategories.length > 0 && (
          <>
            <div
              className="companies-title"
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                textAlign: "center",
                borderRadius: "8px",
                marginTop: "16px",
                marginBottom: "8px",
              }}
            >
              <p className="category-name" style={{ margin: 0, fontWeight: "600" }}>الشركات</p>
            </div>

            {companiesCategories.map((category) => (
              <Link
                key={category.id}
                href={`/companies?category=${category.slug}`}
                className="category"
                aria-label={category.name}
              >
                <div className="img">
                  <img src={category.icon} alt={category.alt || category.name} />
                </div>
                <p className="category-name">{category.name}</p>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
