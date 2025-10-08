"use client";

import { useAuthModal } from "@/stores/useAuthModal";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ChooseRegisterType() {
  const t = useTranslations();
  const { setFormType, setUserType } = useAuthModal((state) => state);
  return (
    <>
      <Image
        width={420}
        height={240}
        src="/auth-register-banner.png"
        alt="register-img"
        className="small-screen-img"
      />
      <div className="mb-3">
        <h2 className="head text-center">{t("auth.registerNewAccount")} </h2>
      </div>
      <div className="form">
        <div className="d-flex flex-column gap-2">
          <button
            onClick={() => {
              setFormType("register");
              setUserType("user");
            }}
            className="personal-account"
          >
            <i className="fa-sharp fa-solid fa-user"></i>
            {t("auth.personal")}
          </button>
          <button
            onClick={() => {
              setFormType("register-company");
              setUserType("company");
            }}
          >
            <i className="fa-sharp fa-solid fa-building"></i>
            {t("auth.company")}
          </button>
        </div>

        <span className="noAccount text-center">
          {t("auth.haveAccount")}{" "}
          <span className="haveAccount-comment">
            {t("auth.haveAccount-comment")}
          </span>
          <div>{t("auth.noAccount")} </div>
        </span>

        <div className="d-flex  gap-2">
          <button
            onClick={() => setFormType("login")}
            className="personal-account"
          >
            {t("auth.login")}
          </button>
          <button onClick={() => setFormType("forget")}>
            {t("auth.forgetPassword")}
          </button>
        </div>
      </div>
    </>
  );
}
