import SearchField from "@/components/search/SearchField";
import SearchNav from "@/components/search/SearchNav";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/search");

  return {
    title: {
      template: `%s - ${t("search.title")}`,
      default: t("search.title"),
    },
    description: t("search.description"),
    alternates,
  };
}

export default async function layout({ searchParams, children }) {
  const search = await searchParams;
  return (
    <section className="search_section">
      <div className="container">
        <SearchField search={search} />
        <SearchNav />
        {children}
      </div>
    </section>
  );
}
