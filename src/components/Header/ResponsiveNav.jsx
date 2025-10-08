"use client";

import { useAuthModal } from "@/stores/useAuthModal";
import { useTranslations } from "next-intl";
import Link from "next/link";

function ResponsiveNav() {
  const t = useTranslations();
  const { userType } = useAuthModal((state) => state);

  return (
    <div className="small_menu">
      {userType === "client" && (
        <Link aria-label="Home" href="/" className="menu_item">
          <i className="fa-solid fa-house-chimney"></i>
          <span>{t("home")}</span>
        </Link>
      )}

      {userType === "company" && (
        <Link aria-label="Home" href="/" className="menu_item">
          <i className="fa-light fa-rectangle-list"></i>
          <span>{t("posts")}</span>
        </Link>
      )}

      {userType === "client" && (
        <Link aria-label="Categories" href="/categories" className="menu_item">
          <i className="fa-solid fa-grid-2"></i>
          <span>{t("header.categories")}</span>
        </Link>
      )}

      <div className="menu_item" style={{ paddingTop: "4px" }}>
        <Link
          aria-label="Add AD"
          className="center"
          href={`${
            userType === "client" ? "/profile/addAd" : "/add-company-product"
          }`}
        >
          <i className="fa-regular fa-plus"></i>
        </Link>
      </div>

      {userType === "client" && (
        <Link aria-label="Asks" href="/companies" className="menu_item">
          <i className="fa-solid fa-store"></i>
          <span> {t("header.companies")}</span>
        </Link>
      )}

      <Link aria-label="Chats" href="/chats" className="menu_item">
        <i className="fa-solid fa-message"></i>
        <span>{t("chats")}</span>
      </Link>
    </div>
  );
}

export default ResponsiveNav;
