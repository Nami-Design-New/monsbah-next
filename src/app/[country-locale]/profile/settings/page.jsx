import SettingsTab from "@/components/profile/SettingsTab";
import { getAuthedUser } from "@/services/auth/getAuthedUser";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses cookies for auth
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/profile/settings");

  return {
    title: t("settings.title"),
    description: t("settings.description"),
    alternates,
  };
}
export default async function page() {
  const user = await getAuthedUser();

  return (
    <div className="tab-content">
      <div className="tab-content-pane ">
        <div className="Dashpoard_section w-100">
          <SettingsTab user={user} />
        </div>
      </div>
    </div>
  );
}
