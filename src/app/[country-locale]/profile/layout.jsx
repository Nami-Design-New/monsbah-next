import MobileHeaderComponent from "@/components/profile/MobileHeaderComponent";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  const alternates = await generateHreflangAlternates("/profile");

  return {
    title: {
      template: `%s | ${t("profile.title")}`,
      default: t("profile.title"),
    },
    description: t("profile.description"),
    alternates,
  };
}

const ProfileLayout = async ({ children }) => {
  return (
    <div className="profile-page">
      <div className="container ">
        <div className="row m-0">
          <div className="d-md-none ">
            <MobileHeaderComponent />
          </div>
          <div className="col-12  col-md-4 col-lg-3  p-2">
            <ProfileTabs />
          </div>
          <div className="col-12 col-md-8 col-lg-9 p-2">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
