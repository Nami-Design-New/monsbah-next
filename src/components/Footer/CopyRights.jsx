"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const CopyRights = () => {
  const t = useTranslations();
  return (
    <p>
      {t("copyRights")} &copy;
      {new Date().getFullYear()}. {t("allRights")}{" "}
      <Link aria-label="Home" href="/">
        {t("appName")}
      </Link>
    </p>
  );
};

export default CopyRights;
