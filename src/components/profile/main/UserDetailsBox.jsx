import { getTranslations } from "next-intl/server";
import Image from "next/image";
import React from "react";

export default async function UserDetailsBox({ children }) {
  const t = await getTranslations();
  return (
    <div className="user-details-box">
      <span className="title">{t("profile.country")}</span>
      <span className="value">{children}</span>
    </div>
  );
}
