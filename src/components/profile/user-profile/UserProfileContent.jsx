import CopyButton from "@/components/companies/CopyButton";
import ShareButton from "@/components/shared/ShareButton";
import StarsRate from "@/components/shared/StarsRate";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function UserProfileContent({ client }) {
  const t = await getTranslations();
  return (
    <>
      <div className="content">
        <div className="title">
          <h3>{client?.name}</h3>
          <div className="actions">
            <Link
              aria-label="whatsapp"
              target="_blank"
              href={`https://wa.me/${client?.whats_number}`}
              className=" follow_btn"
            >
              <Image width={16} height={16} src="/icons/whats.svg" alt="" />
            </Link>

            <Link
              aria-label="Profile"
              className=" follow_btn"
              href={`/chats?user_id=${client?.id}`}
            >
              <i className="fa-solid fa-comment-dots"></i>
            </Link>
            <ShareButton />
          </div>
        </div>

        <div className="stats">
          <div className="f_badge">
            <i className="fa-regular fa-user-check"></i>{" "}
            {client?.["followers-count"]} <span>{t("Followers")}</span>
          </div>
          <div className="f_badge">
            <i className="fa-light fa-user-group"></i>{" "}
            {client?.["following-count"]}
            <span>{t("following")}</span>
          </div>
          <div className="f_badge">
            <i className="fa-light fa-clothes-hanger"></i>{" "}
            {client?.["ads-count"]}
            <span> {t("posts")}</span>
          </div>
          <div className="f_badge">
            <i className="fa-light fa-location-dot"></i> {t("loaction")}{" "}
            <span>
              {client?.city?.name} ، {client?.country?.name}
            </span>
          </div>
        </div>

        <StarsRate
          rate={client?.rate}
          reviewsCount={client?.rate_count}
          showbtn={true}
          company={client}
        />
      </div>
    </>
  );
}
