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
    router.replace(pathname, {
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
