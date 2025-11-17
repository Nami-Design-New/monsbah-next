"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { IoLanguage } from "react-icons/io5";
import { Dropdown } from "react-bootstrap";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function handleLanguageChange(lang) {
    // Category slugs are always in Arabic, so when switching to English
    // we need to redirect to the home page or companies page instead of keeping the Arabic slug
    let targetPath = pathname;
    
    // Check if current path contains Arabic characters (category/subcategory slug)
    const hasArabicChars = /[\u0600-\u06FF]/.test(pathname);
    
    // If switching to English and path has Arabic, redirect to appropriate root
    if (lang === "en" && hasArabicChars) {
      // Determine if it's a company route or regular route
      if (pathname.includes("/companies")) {
        targetPath = "/companies";
      } else if (pathname.includes("/blogs")) {
        targetPath = "/blogs";
      } else if (pathname.includes("/categories")) {
        targetPath = "/categories";
      } else {
        targetPath = "/";
      }
    }
    
    router.replace(targetPath, {
      locale: locale.split("-")[0] + "-" + lang,
    });
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        aria-label="Language"
        id="dropdown-basic"
        className="link"
      >
        <IoLanguage />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleLanguageChange("ar")}>
          العربية
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleLanguageChange("en")}>
          English
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
