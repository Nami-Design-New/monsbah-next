"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function FollowersNav() {
  const pathname = usePathname();
  const t = useTranslations("profile");

  const links = [
    { href: "/followers", label: t("followers") },
    { href: "/followers/followings", label: t("followings") },
  ];

  return (
    <nav className="search_nav">
      {links.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className={isActive ? "active" : ""}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
