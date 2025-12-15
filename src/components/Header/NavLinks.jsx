"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuthModal } from "@/stores/useAuthModal";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import NavDropdown from "./NavDropdown";

const NavLinks = ({ categories = [], companyCategories = [] }) => {
  const t = useTranslations("header");
  const pathname = usePathname();
  const { userType } = useAuthModal((state) => state);

  return (
    <nav className="navbar navbar-expand-lg d-lg-flex d-none ">
      <div className="navbar-nav">
        <Link aria-label="Home" className="logo" href="/">
          <Image
            src="/branding/logo.svg"
            width={120}
            height={40}
            alt="logo image"
            unoptimized
          />
        </Link>

        <Link
          className={`navLink  ${pathname === "/" ? "active" : ""}`}
          href="/"
        >
          {t("home")}
        </Link>
        {userType === "client" && (
          <NavDropdown
            title={t("categories")}
            href="/categories"
            isActive={pathname === "/categories" || pathname.startsWith("/categories")}
            items={categories}
            isLoading={false}
            linkPrefix="/"
          />
        )}
        <NavDropdown
          title={t("companies")}
          href="/companies"
          isActive={pathname === "/companies" || pathname.startsWith("/companies")}
          items={companyCategories}
          isLoading={false}
          linkPrefix="/companies?category="
        />
        <Link
          className={`navLink  ${pathname === "/about" ? "active" : ""}`}
          href="/about"
        >
          {t("aboutUs")}
        </Link>
        <Link
          className={`navLink  ${pathname === "/blogs" ? "active" : ""}`}
          href="/blogs"
        >
          {t("blogs")}
        </Link>
        <Link
          className={`navLink  ${pathname === "/chats" ? "active" : ""}`}
          href="/chats"
        >
          {t("chats")}
        </Link>
        <Link
          className={`navLink  ${pathname === "/contact" ? "active" : ""}`}
          href="/contact"
        >
          {t("contact")}
        </Link>
      </div>
    </nav>
  );
};

export default NavLinks;
