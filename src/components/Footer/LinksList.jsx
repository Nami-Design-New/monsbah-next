import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import React from "react";

const LinksList = async ({ navLinks }) => {
  const t = await getTranslations("footer");
  return (
    <ul>
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link href={link.href} aria-label={link.ariaLabel}>
            <span>
              <i className={link.iconClass} />
            </span>
            {t(link.labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default LinksList;
