import { getLocale, getTranslations } from "next-intl/server";
import BoxRate from "./BoxRate";
import CoverImageWithActions from "./CoverImageWithActions";
import DeleteAccountText from "./DeleteAccountText";
import ProfileStatsCard from "./ProfileStatsCard";
import UserDetailBoxes from "./UserDetailBoxes";
import { getAuthedUser } from "@/services/auth/getAuthedUser";

export default async function MainInfoTab() {
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
                  <p>{lang === "en" ? user?.about_en : user?.about_ar}</p>
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
