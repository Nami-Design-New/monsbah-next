"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "use-intl";
import LogoutComponent from "./LogoutComponent";

export default function MobileHeaderComponent() {
  const t = useTranslations("profile");
  const pathname = usePathname().split("/").filter(Boolean);
  let name;
  if (pathname.length > 2) {
    name = pathname[1];
  } else {
    name = pathname[pathname.length - 1];
  }

  const [showTabs, setShowTabs] = useState(false);

  return (
    <div className="tabs-section">
      <div className="header-back">
        <h3> {`${t(name)}` || "edit"} </h3>

        <button
          className="arrow_icon"
          onClick={() => setShowTabs((prev) => !prev)}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>{" "}
      {showTabs && (
        <div className="profileResponsiveNav">
          <div className="nav-item">
            <Link
              aria-label={t("main")}
              href={"/profile"}
              onClick={() => setShowTabs(false)}
            >
              <i className="fa-regular fa-user" />
              {t("main")}
            </Link>
          </div>
          <div className="nav-item">
            <Link
              aria-label={t("myAds")}
              href={"/profile/ads"}
              onClick={() => setShowTabs(false)}
            >
              <i className="fa-regular fa-bullhorn"></i>
              {t("myAds")}
            </Link>
          </div>
          <div className="nav-item">
            <Link
              aria-label={t("addAd")}
              href={"/profile/addAd"}
              onClick={() => setShowTabs(false)}
            >
              <i className="fa-regular fa-plus"></i>
              {t("addAd")}
            </Link>
          </div>
          {/* <div className="nav-item">
            <Link aria-label={t("myAsks")}  href = {"/profile/favorites"}>
              <i className="fa-regular fa-message-question"></i>
              {t("myAsks")}
            </Link>
          </div> */}
          <div className="nav-item">
            <Link
              aria-label={t("notifications")}
              href={"/profile/notifications"}
              onClick={() => setShowTabs(false)}
            >
              <i className="fa-regular fa-bell"></i>
              {t("notifications")}
            </Link>
          </div>
          <div className="nav-item">
            <Link
              aria-label={t("favorites")}
              href={"/profile/favorites"}
              onClick={() => setShowTabs(false)}
            >
              <i className="fa-regular fa-heart" />
              {t("favorites")}
            </Link>
          </div>
          <div className="nav-item">
            <Link
              aria-label={t("settings")}
              href={"/profile/settings"}
              onClick={() => setShowTabs(false)}
            >
              <i className="fa-regular fa-gear" />
              {t("settings")}
            </Link>
          </div>
          <div className="nav-item">
            <Link
              aria-label={t("verification")}
              href={"/profile/verification"}
              onClick={() => setShowTabs(false)}
            >
              <i className="fa-regular fa-badge-check" />
              {t("verification")}
            </Link>
          </div>
          <div className="nav-item" onClick={() => setShowTabs(false)}>
            <LogoutComponent />
            {/* <Link aria-label={t("logout")}>
              <i className="fa-regular fa-arrow-right-from-bracket"></i>
              {t("logout")}
            </Link> */}
          </div>
        </div>
      )}
    </div>
  );
}
