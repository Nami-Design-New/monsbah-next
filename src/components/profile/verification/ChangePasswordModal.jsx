"use client";

import PasswordField from "@/components/shared/forms/PasswordField";
import SubmitButton from "@/components/shared/forms/SubmitButton";
import useChangePasswordForm from "@/hooks/controllers/useChangePasswordForm";
import { changePasswordAction } from "@/libs/actions/profileActions";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "sonner";

function ChangePasswordModal({ showModal, setShowModal }) {
  const t = useTranslations();
  const [loading, setIsLoading] = useState();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useChangePasswordForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await changePasswordAction(data);

      if (res.status === 200) {
        toast.success(t("profile.passwordSuccessfullyUpdated"));
        setShowModal(false);
        reset();
      } else {
        toast.error(t("someThingWentWrong"));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t("someThingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header className="pb-0" closeButton>
        <h5>{t("profile.changePassword")}</h5>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <PasswordField
            label={t("auth.oldPassword")}
            placeholder={t("auth.oldPassword")}
            id="old_password"
            name="old_password"
            {...register("old_password")}
            error={errors.old_password?.message}
          />
          <PasswordField
            label={t("auth.password")}
            placeholder={t("auth.password")}
            id="password"
            name="password"
            {...register("password")}
            error={errors.password?.message}
          />
          <PasswordField
            label={t("auth.passwordConfirmation")}
            placeholder={t("auth.passwordConfirmation")}
            id="password_confirmation"
            name="password_confirmation"
            {...register("password_confirmation")}
            error={errors.password_confirmation?.message}
          />
          <div className="btns mt-3">
            <SubmitButton
              text={t("save")}
              className="wizard_btn next"
              loading={loading}
            />
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default ChangePasswordModal;
