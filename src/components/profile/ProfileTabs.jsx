"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { PROFILE_TABS } from "@/utils/constants";
import { useTranslations } from "next-intl";
import LogoutComponent from "./LogoutComponent";

const ProfileTabs = () => {
  const t = useTranslations("profile");
  const pathname = usePathname();
  const segments = pathname.split("/");
  const activeTab = segments[segments.length - 1];

  return (
    <div className="tabs-section">
      <ul className="profileNavCol nav nav-tabs">
        <li className="nav-item">
          <Link
            href={`/profile`}
            className={activeTab === "profile" ? "active" : ""}
          >
            <i className={`fa-regular fa-user mr-2`} />
            {t("main")}
          </Link>
        </li>
        {PROFILE_TABS.map((tab) => (
          <li className="nav-item" key={tab.key}>
            <Link
              href={`/profile/${tab.key}`}
              className={activeTab === tab?.key ? "active" : ""}
            >
              <i className={`fa-regular ${tab.icon} mr-2`} />
              {t(`${tab.key}`)}
            </Link>
          </li>
        ))}
        <li className="nav-item">
          <LogoutComponent />
        </li>
      </ul>
    </div>
  );
};

export default ProfileTabs;
