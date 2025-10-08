import AddEditAdForm from "@/components/profile/ads/AddEditAdForm";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses cookies for auth
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/profile/addAd");

  return {
    title: t("addAd.title"),
    description: t("addAd.description"),
    alternates,
  };
}
export default function page() {
  return <AddEditAdForm />;
}
