import SideBar from "@/components/categories/SideBar";
import SubCategoriesList from "@/components/categories/SubCategoriesList";
import { getCategories } from "@/services/categories/getCategories";
import { getSubCategories } from "@/services/categories/getSubCategories";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getTranslations } from "next-intl/server";

// Mark as dynamic since it uses searchParams
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const t = await getTranslations("meta");
  const categorySlug = (await searchParams)?.category ?? null;
  const isValidSlug =
    typeof categorySlug === "string" && /^[a-z0-9-]+$/i.test(categorySlug);
  const safeSlug = isValidSlug ? categorySlug : null;

  // Fetch sub-categories for metadata (future use)
  const _subCategories = await getSubCategories({
    category_slug: safeSlug,
  });

  const pathname = safeSlug
    ? `/categories?category=${safeSlug}`
    : "/categories";
  const alternates = await generateHreflangAlternates(pathname);

  return {
    title: safeSlug
      ? `${t("categories.titlePrefix")} ${safeSlug}`
      : t("categories.defaultTitle"),
    description: safeSlug
      ? `${t("categories.descriptionPrefix")} ${safeSlug}`
      : t("categories.defaultDescription"),
    alternates,
  };
}

export default async function Categories({ searchParams }) {
  const selectedCategory = (await searchParams).category ?? null;
  const categories = await getCategories();

  return (
    <section className="categories-page explore_ads">
      <div className="container">
        <div className="row">
          <SideBar selectedCategory={selectedCategory} />
          <SubCategoriesList
            categories={categories}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </section>
  );
}
