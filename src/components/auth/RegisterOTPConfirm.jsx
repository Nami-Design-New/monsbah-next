"use client";
import { useAuthModal } from "@/stores/useAuthModal";
import OtpContainer from "@/components/shared/forms/OtpContainer";
import SubmitButton from "@/components/shared/forms/SubmitButton";
import clientAxios from "@/libs/axios/clientAxios";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import ResendCodeTimer from "./ResendCodeTimer";
import { handleLogin } from "@/services/auth/LoginService";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "@/i18n/navigation";

const RegisterOTPConfirm = () => {
  const t = useTranslations();
  const router = useRouter();
  const { setFormType, onClose, userType } = useAuthModal((state) => state);
  const login = useAuthStore((state) => state.login);
  const [otpVerifyCode, setOtpVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { watch } = useFormContext();
  const formData = watch();

  const handleResend = async () => {
    setLoading(true);
    const payload = { ...formData, new_version: 1 };
    payload.phone = formData.country_code + formData.phone;

    try {
      const res = await clientAxios.post("/client/auth/sign-up", payload);

      if (res.status === 200) {
        toast.success(t("otpResendSuccess"));
      }
    } catch (error) {
      toast.error(t("otpResendFail"));
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await clientAxios.post("/client/auth/sign-up/verify-phone", {
        ...formData,
        phone: formData.country_code + formData.phone,
        new_version: 1,
        otp: +otpVerifyCode.code,
      });
      if (res.status === 200) {
        const data = await handleLogin({
          userType,
          country_code: formData?.country_code,
          phone: formData?.phone,
          password: formData?.password,
          fcm_token: formData?.fcm_token,
        });

        toast.success(data?.message);
        login(data.token, data.client_data);
        localStorage.setItem(
          "user_type",
          data.client_data?.user_type === "user" ? "client" : "company"
        );
        onClose(false);
        router.push("/");
        setFormType("login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
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

      <ResendCodeTimer
        initialTime={60}
        onResend={handleResend}
        resendText={t("auth.resendCode")}
        didNotReceiveText={t("auth.didnotReceiveCode")}
      />

      <div className="d-flex align-items-center gap-2">
        <button
          aria-label="Back"
          className="back_btn"
          onClick={(e) => {
            e.preventDefault();
            setFormType("register");
          }}
        >
          <i className="fal fa-arrow-right"></i>
        </button>
        <SubmitButton text={t("auth.verify")} loading={loading} />
      </div>
    </form>
  );
};

export default RegisterOTPConfirm;
