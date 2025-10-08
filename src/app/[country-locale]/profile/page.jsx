import BoxRate from "@/components/profile/main/BoxRate";
import CoverImageWithActions from "@/components/profile/main/CoverImageWithActions";
import DeleteAccountText from "@/components/profile/main/DeleteAccountText";
import ProfileStatsCard from "@/components/profile/main/ProfileStatsCard";
import UserDetailBoxes from "@/components/profile/main/UserDetailBoxes";
import { getAuthedUser } from "@/services/auth/getAuthedUser";
import { getLocale, getTranslations } from "next-intl/server";

// Mark as dynamic - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function ProfileRootPage() {
  const t = await getTranslations();
  const lang = await getLocale();
  const user = await getAuthedUser();

  return (
    <div className="tab-content">
      <div className="tab-content-pane ">
        <div className="Dashpoard_section w-100">
          <div className="row m-0">
            <CoverImageWithActions data={user} />
            <div className="col-12 p-2">
              <p>
                {user?.about_en || user?.about_ar ? (
                  <span>{lang === "en" ? user?.about_en : user?.about_ar}</span>
                ) : null}
              </p>
            </div>
            {(user?.country || user?.city) && (
              <UserDetailBoxes country={user?.country} city={user?.city} />
            )}
            {(user?.["following-count"] ||
              +user?.["following-count"] === 0) && (
              <ProfileStatsCard
                href="/followers/followings"
                count={user?.["following-count"]}
                label={t("Followings")}
              />
            )}
            {(user?.["followers-count"] ||
              +user?.["followers-count"] === 0) && (
              <ProfileStatsCard
                href="/followers"
                count={user?.["followers-count"]}
                label={t("Followers")}
              />
            )}
            {(user?.["ads-count"] || +user?.["ads-count"] === 0) && (
              <ProfileStatsCard
                href="/ads"
                count={user?.["ads-count"]}
                label={t("Ad")}
              />
            )}

            {(user?.["rate-count"] || +user?.["rate-count"] === 0) && (
              <div className="col-lg-3 col-md-6 col-6 p-2">
                <BoxRate rate={user?.["rate-count"]} />
              </div>
            )}
            <DeleteAccountText />
          </div>
        </div>
      </div>
    </div>
  );
}
