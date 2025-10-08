"use client";

import { useTranslations } from "next-intl";
import React from "react";

export default function ShareMyProfile({ className, profile }) {
  const { t } = useTranslations();
  let currentUrl = window.location.href;
  const currentPageLink = currentUrl.replace(
    "/company-profile",
    `/companies/${profile?.id}`
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: profile?.name,
          text: profile?.about,
          url: currentPageLink,
        })
        .then(() => t("Shared successfully"))
        .catch((error) => t("Error sharing:", error));
    } else {
      alert(t("share_not_supported"));
    }
  };

  return (
    <button className={`${className} share_btn`} onClick={handleShare}>
      <i className="fa-regular fa-share-nodes"></i>
    </button>
  );
}
