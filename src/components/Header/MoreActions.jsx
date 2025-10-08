"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import GetApp from "../shared/modals/GetApp";
import { useState } from "react";
import { useAuthModal } from "@/stores/useAuthModal";

const MoreActions = () => {
  const t = useTranslations("header");
  const [showGetAppModal, setShowGetAppModal] = useState(false);
  const { userType } = useAuthModal((state) => state);
  return (
    <>
      <Link
        aria-label="Get App"
        className="customBtn"
        style={{ whiteSpace: "nowrap" }}
        href={"/sections"}
      >
        {t("categories")}
      </Link>
      <Link
        aria-label="add post"
        href={`${
          userType === "client" ? "/profile/addAd" : "/add-company-product"
        }`}
        className="link text d-lg-flex d-none"
      >
        <Image src="/icons/plus.svg" width={16} height={16} alt="" />
        {t("addPost")}
      </Link>{" "}
      <GetApp show={showGetAppModal} setShow={setShowGetAppModal} />
    </>
  );
};

export default MoreActions;
