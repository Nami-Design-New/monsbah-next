import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import React from "react";

const AboutCompany = async () => {
  const t = await getTranslations();
  return (
    <div className="about_company">
      <div className="logo">
        <Link href="/" aria-label="Home">
          <Image alt="logo" src="/branding/icon.svg" width={56} height={86} />
        </Link>
      </div>
      <div className="text">
        <p>{t("aboutApp")}</p>
      </div>
    </div>
  );
};

export default AboutCompany;
