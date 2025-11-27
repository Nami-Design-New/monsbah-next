import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function JoinNowSection() {
  const t = await getTranslations("about");

  return (
    <div className="join-now-section">
      <div className="join-content">
        <h2 className="h3">{t("joinNow")}</h2>
        <p className="join-description">{t("joinDesc")}</p>
        <Link href="/profile/addAd" className="btn btn-primary btn-lg">
          {t("joinNow")}
        </Link>
      </div>
    </div>
  );
}
