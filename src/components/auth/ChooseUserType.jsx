"use client";

import { useAuthModal } from "@/stores/useAuthModal";
import { useTranslations } from "next-intl";

export default function ChooseUserType() {
  const t = useTranslations("auth");
  const userState = useAuthModal((state) => state.userType);
  const setUserState = useAuthModal((state) => state.setUserType);

  return (
    <div className="input-field mb-4">
      <div className="radios">
        <label htmlFor="client">
          <input
            type="radio"
            name="userState"
            id="client"
            value="client"
            checked={userState === "client"}
            onChange={(e) => setUserState(e.target.value)}
          />
          <span>{t("client")}</span>
        </label>

        <label htmlFor="company">
          <input
            type="radio"
            name="userState"
            id="company"
            value="company"
            checked={userState === "company"}
            onChange={(e) => setUserState(e.target.value)}
          />
          <span>{t("company")}</span>
        </label>
      </div>
    </div>
  );
}
