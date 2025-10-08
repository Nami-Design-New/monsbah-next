"use client";
import ConfirmationModal from "@/components/shared/modals/ConfirmationModal";
import { useRouter } from "@/i18n/navigation";
import { deleteAccountAction } from "@/libs/actions/accountActions";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function DeleteAccountText() {
  const t = useTranslations();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteAccount = () => {
    startTransition(async () => {
      const res = await deleteAccountAction();

      if (!res.success) {
        toast.error(error?.message);
      } else {
        toast.success(res?.data?.message);
        router.replace("/");
        localStorage.removeItem("user_type");
      }
    });
  };
  return (
    <>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="col-12 d-flex mt-4 align-items-center justify-content-end"
      >
        <span className="delete-account">{t("profile.deleteAccount")}</span>
      </button>
      <ConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        type="delete"
        eventFun={handleDeleteAccount}
        loading={isPending}
        buttonText={t("delete")}
        text={t("auth.areYouSureYouWantToDeleteAccount")}
      />
    </>
  );
}
