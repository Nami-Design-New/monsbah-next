import React, { useState } from "react";
import OtpContainer from "../shared/forms/OtpContainer";
import SubmitButton from "../shared/forms/SubmitButton";
import { useAuthModal } from "@/stores/useAuthModal";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import clientAxios from "@/libs/axios/clientAxios";

const OTPConfirm = () => {
  const t = useTranslations();
  const { formType, setFormType, userType } = useAuthModal((state) => state);
  const [otpVerifyCode, setOtpVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { watch } = useFormContext();
  const formData = watch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await clientAxios.post(`/${userType}/auth/reset-password`, {
        phone: formData.country_code + formData.phone,
        country_code: formData.country_code,
        token: otpVerifyCode.code,
      });
      if (res.status === 200) {
        toast.success(res.data?.message);
        setFormType("reset");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="mb-4">
        <h2 className="head">{t("auth.confirmOTPTitle")} </h2>
        <p className="sub-head">{t("auth.confirmOTPSubtitle")}</p>
      </div>

      <OtpContainer formData={otpVerifyCode} setFormData={setOtpVerifyCode} />

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
        <SubmitButton text={t("auth.verify")} loading={loading} />
      </div>
    </form>
  );
};

export default OTPConfirm;
