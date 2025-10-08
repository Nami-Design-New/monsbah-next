import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function MyAdsHeader() {
  const t = await getTranslations();

  return (
    <div className="col-12 p-2 d-flex justify-content-end">
      <Link
        className="customBtn d-flex align-items-center gap-2 justify-content-center m-0"
        style={{ cursor: "pointer" }}
        href="/profile/addAd"
      >
        <i className="fa-regular fa-circle-plus"></i>
        <h6 className="m-0" style={{ lineHeight: 1 }}>
          {t("header.addPost")}
        </h6>
      </Link>
    </div>
  );
}
