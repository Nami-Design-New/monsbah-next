import FollowersNav from "@/components/followers/FollowersNav";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import React from "react";
import { generateHreflangAlternates } from "@/utils/hreflang";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  const alternates = await generateHreflangAlternates("/followers");

  return {
    title: t("followers.title", { default: "Followers" }),
    description: t("followers.description", {
      default: "Followers and followings",
    }),
    alternates,
  };
}

export default async function Layout({ children }) {
  const t = await getTranslations();
  return (
    <section className="search_section">
      <div className="container">
        {/* <nav className="search_nav">
          <Link href="/followers">{t("profile.followers")}</Link>
          <Link href="/followers/followings">{t("profile.followings")}</Link>
        </nav> */}
        <FollowersNav />
        <div className="row">{children}</div>
      </div>
    </section>
  );
}
