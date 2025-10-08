import React, { useState } from "react";
import PasswordField from "../shared/forms/PasswordField";
import { useResetPasswardForm } from "@/hooks/controllers/useResetPasswardForm";
import SubmitButton from "../shared/forms/SubmitButton";
import { useTranslations } from "next-intl";
import { useAuthModal } from "@/stores/useAuthModal";
import { toast } from "sonner";
import clientAxios from "@/libs/axios/clientAxios";

const ResetPassword = () => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { userType, setFormType, onClose } = useAuthModal((state) => state);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useResetPasswardForm();
  const onSubmit = async (data) => {
    const payload = data;
    setLoading(true);
    try {
      const res = await clientAxios.post(
        `/${userType}/auth/change-password`,
        payload
      );
      if (res.status === 200) {
        toast.success(res.data?.message);

        setFormType("login");

        // const updatedParams = new URLSearchParams(searchParams);
        // updatedParams.delete("redirect");
        // setSearchParams(updatedParams);
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data.message);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <h2 className="head">{t("auth.changePasswordTitle")} </h2>
        <p className="sub-head">{t("auth.changePasswordSubtitle")}</p>
      </div>

      <PasswordField
        label={t("auth.password")}
        placeholder={t("auth.password")}
        id="password"
        {...register("password")}
        error={errors?.password?.message}
      />

      <PasswordField
        label={t("auth.passwordConfirmation")}
        placeholder={t("auth.passwordConfirmation")}
        id="password_confirmation"
        {...register("password_confirmation")}
        error={errors?.password_confirmation?.message}
      />

      <div className="d-flex align-items-center gap-2">
        <button
          aria-label="Back"
          className="back_btn"
          onClick={(e) => {
            e.preventDefault();
            setFormType("forget");
          }}
        >
          <i className="fal fa-arrow-right"></i>
        </button>

        <SubmitButton text={t("save")} loading={loading} />
      </div>
    </form>
  );
};

export default ResetPassword;
