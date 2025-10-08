import { Link } from "@/i18n/navigation";
import { getCategories } from "@/services/categories/getCategories";
import Image from "next/image";

export default async function SideBar({ selectedCategory }) {
  const categoryList = await getCategories();

  return (
    <div className="col-lg-2 col-md-3 col-4 p-lg-2 p-1">
      <div className="categories_sidebar">
        <Link
          aria-label="All Categories"
          href="/categories"
          className={`category ${selectedCategory === null ? "active" : ""}`}
        >
          <div className="img">
            <Image width={32} height={32} src="/icons/all.svg" alt="all" />
          </div>
          <h6>All</h6>
        </Link>

        {categoryList.map((category) => (
          <Link
            key={category.id}
            href={`/categories?category=${category.slug}`}
            className={`category ${
              category.slug === selectedCategory ? "active" : ""
            }`}
            aria-label={category.name}
          >
            <div className="img">
              <img src={category.image} alt={category.name} />
            </div>
            <h6>{category.name}</h6>
          </Link>
        ))}
      </div>
    </div>
  );
}
