import BlogsList from "@/components/blogs/BlogsList";
import { getBlogs } from "@/services/blogs/getBlogs";
import { getCountries } from "@/services/getCountries";
import { BASE_URL, LOCALES } from "@/utils/constants";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses cookies
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  const alternates = await generateHreflangAlternates("/blogs");

  return {
    title: t("blogs.title"),
    description: t("blogs.description"),
    openGraph: {
      title: t("blogs.title"),
      description: t("blogs.description"),
    },
    alternates,
  };
}

export default async function Blogs() {
  return <BlogsList />;
}
