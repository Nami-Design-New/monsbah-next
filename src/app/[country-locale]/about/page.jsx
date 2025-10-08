import AboutSection from "@/components/about/AboutSection";
import Countries from "@/components/about/Countries";
import HowItWorks from "@/components/about/HowItWorks";
import { generateHreflangAlternates } from "@/utils/hreflang";
import { getTranslations } from "next-intl/server";

// Mark as dynamic - uses cookies
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { "country-locale": _countryLocale } = await params;
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/about");
  return {
    title: { absolute: t("about.title") },
    description: t("about.description"),
    openGraph: {
      title: t("about.title"),
      description: t("about.description"),
    },
    alternates,
  };
}

export default async function About() {
  return (
    <section className="aboutus_section">
      <div className="container">
        <AboutSection />
        <HowItWorks />
        <Countries />
      </div>
    </section>
  );
}
