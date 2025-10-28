import SideBar from "@/components/categories/SideBar";
import SubCategoriesList from "@/components/categories/SubCategoriesList";
import { getCategories } from "@/services/categories/getCategories";
import { getSubCategories } from "@/services/categories/getSubCategories";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getTranslations } from "next-intl/server";
import { resolveCanonicalUrl } from "@/utils/canonical";

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

  let canonicalUrl = null;
  if (safeSlug) {
    try {
      const categories = await getCategories();
      const matchedCategory = categories?.find(
        (item) => item.slug === safeSlug
      );
      canonicalUrl = resolveCanonicalUrl(
        matchedCategory?.canonical_url,
        matchedCategory?.canonicalUrl,
        matchedCategory?.canonical
      );
    } catch {
      // Ignore failures and fall back to default alternates
    }
  }

  const pathname = safeSlug
    ? `/categories?category=${safeSlug}`
    : "/categories";
  const alternates = await generateHreflangAlternates(pathname);
  if (canonicalUrl) {
    alternates.canonical = canonicalUrl;
  }

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
  const metaT = await getTranslations("meta");
  const isValidSlug =
    typeof selectedCategory === "string" && /^[a-z0-9-]+$/i.test(selectedCategory);
  const safeSlug = isValidSlug ? selectedCategory : null;
  const pageTitle = safeSlug
    ? `${metaT("categories.titlePrefix")} ${safeSlug}`
    : metaT("categories.defaultTitle");
  const visuallyHiddenStyle = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  };

  return (
    <section className="categories-page explore_ads">
      <div className="container">
        <h1 style={visuallyHiddenStyle}>{pageTitle}</h1>
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
