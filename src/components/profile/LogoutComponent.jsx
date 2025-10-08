"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { logout as logoutAction } from "@/libs/actions/logoutAction";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import ConfirmationModal from "../shared/modals/ConfirmationModal";

export default function LogoutComponent({ withIcon = true, isHome = false }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const t = useTranslations();
  const [loading, setisLoading] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

  const performLogout = async () => {
    setisLoading(true);

    const res = await logoutAction();
    if (!res?.success) {
      toast.error(error?.message);
    } else {
      toast.success(res?.data?.message);
      router.push("/");
      localStorage.removeItem("user_type");
      logout();
      if (isHome === true) {
        window.location.reload();
      }
    }
    setisLoading(false);
  };
  return (
    <>
      <button onClick={() => setShowLogoutModal(true)} disabled={loading}>
        {withIcon && (
          <i className={`fa-regular fa-arrow-right-from-bracket mr-2`} />
        )}
        {t("logout")}
      </button>
      <ConfirmationModal
        showModal={showLogoutModal}
        setShowModal={setShowLogoutModal}
        type="logout"
        eventFun={performLogout}
        loading={loading}
        buttonText={t("profile.logout")}
        text={t("auth.areYouSureYouWantToLogout")}
      />
    </>
  );
}
