import BlogsList from "@/components/blogs/BlogsList";
import { getBlogs } from "@/services/blogs/getBlogs";
import { getCountries } from "@/services/getCountries";
import { BASE_URL, LOCALES } from "@/utils/constants";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getSettings } from "@/services/settings/getSettings";
import { resolveCanonicalUrl } from "@/utils/canonical";

// Mark as dynamic - uses cookies
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  const alternates = await generateHreflangAlternates("/blogs");

  // Fetch settings for blogs metadata
  try {
    const settings = await getSettings();
    if (settings?.meta?.blogs) {
      const blogsMeta = settings.meta.blogs;
      const blogsCanonicalUrl = resolveCanonicalUrl(
        blogsMeta?.canonical_url,
        blogsMeta?.canonicalUrl,
        blogsMeta?.canonical
      );
      
      if (blogsCanonicalUrl) {
        alternates.canonical = blogsCanonicalUrl;
      }
      
      const title = blogsMeta?.meta_title || t("blogs.title");
      const description = blogsMeta?.meta_description || t("blogs.description");
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
        },
        alternates,
      };
    }
  } catch {
    // Ignore errors and use fallback
  }

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
