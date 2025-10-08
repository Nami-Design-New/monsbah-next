import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import ShareButton from "../shared/ShareButton";
import StarsRate from "../shared/StarsRate";
import CopyButton from "./CopyButton";
import ShareMyProfile from "../shared/ShareMyProfile";
import { profile } from "console";

export default async function CompanyProfileContent({
  client,
  isMyProfile = false,
}) {
  const t = await getTranslations();

  return (
    <>
      <div className="content">
        <div className="title">
          <h3>{client?.name}</h3>
          <div className="actions">
            {isMyProfile ? (
              <Link className="add_product" href="/add-company-product">
                <i className="fa-regular fa-plus"></i> {t("profile.addAd")}
              </Link>
            ) : (
              <Link
                aria-label="whatsapp"
                target="_blank"
                href={`https://wa.me/${client?.whats_number}`}
                className=" follow_btn"
              >
                <img src="/icons/whats.svg" alt="" />
              </Link>
            )}
            {isMyProfile ? (
              <Link className="follow_btn" href="/edit-company-profile">
                <i className="fa-light fa-pencil"></i>
              </Link>
            ) : (
              <Link
                aria-label="Profile"
                className=" follow_btn"
                href={`/chats?user_id=${client?.id}`}
              >
                <i className="fa-solid fa-comment-dots"></i>
              </Link>
            )}
            {isMyProfile ? (
              <ShareMyProfile profile={client} />
            ) : (
              <ShareButton />
            )}
          </div>
        </div>

        <div className="stats">
          <div className="f_badge">
            {" "}
            <div className="d-flex flex-column">
              <span className="d-flex gap-2">
                <i className="fa-regular fa-user-check"></i>{" "}
                {client?.["followers-count"]}{" "}
              </span>
              <span>{t("Followers")}</span>
            </div>
          </div>
          <div className="f_badge">
            <div className="d-flex flex-column">
              <span className="d-flex gap-2">
                <i className="fa-light fa-user-group"></i>{" "}
                {client?.["following-count"]}
              </span>
              <span>{t("following")}</span>
            </div>
          </div>
          <div className="f_badge">
            <div className="d-flex flex-column">
              <span className="d-flex gap-2">
                <i className="fa-light fa-clothes-hanger"></i>{" "}
                {client?.["ads-count"]}
              </span>
              <span> {t("posts")}</span>
            </div>
          </div>
          <div className="f_badge">
            {" "}
            <div className="d-flex flex-column">
              <span className="d-flex gap-2">
                <i className="fa-light fa-location-dot"></i> {t("loaction")}{" "}
              </span>
              <span>
                {client?.city?.name} ، {client?.country?.name}
              </span>
            </div>
          </div>
        </div>

        <StarsRate
          rate={client?.rate}
          reviewsCount={client?.rate_count}
          showbtn={true}
          company={client}
        />
        <CopyButton />
      </div>
    </>
  );
}
