"use client";

import useCompanyRegisterForm from "@/hooks/controllers/useCompanyRegisterForm";
import { useForgetPasswordForm } from "@/hooks/controllers/useForgetPasswordForm";
import { useRegisterForm } from "@/hooks/controllers/useRegisterForm";
import { useAuthModal } from "@/stores/useAuthModal";
import Image from "next/image";
import { Modal } from "react-bootstrap";
import { FormProvider } from "react-hook-form";
import { GoX } from "react-icons/go";
import ChooseRegisterType from "./ChooseRegisterType";
import CompanyOTPConfirm from "./CompanyOTPConfirm";
import ForgetPassword from "./ForgetPassword";
import Login from "./Login";
import OTPConfirm from "./OTPConfirm";
import Register from "./Register";
import RegisterCompany from "./RegisterCompany";
import RegisterOTPConfirm from "./RegisterOTPConfirm";
import ResetPassword from "./ResetPassword";
import { useDeleteSearchParams } from "@/hooks/helpers/useDeleteSearchParams";

export default function AuthModal() {
  const { closeAuthModal } = useDeleteSearchParams();
  const {
    isOpen: show,
    onClose,
    setFormType,
    formType,
  } = useAuthModal((state) => state);
  const methods = useRegisterForm();
  const companyFormMethods = useCompanyRegisterForm();
  const forgetPassordMethods = useForgetPasswordForm();
  const handleClose = () => {
    onClose();
    closeAuthModal();
    setFormType("login");
    methods.reset();
  };

  return (
    <Modal
      centered
      show={show}
      className="authModal"
      backdrop="static"
      size="xl"
    >
      <Modal.Body>
        <button
          aria-label="Close modal"
          className="closeModal"
          onClick={handleClose}
        >
          <GoX />
        </button>
        <section className="auth_section">
          <div className={`img_wrapper ${formType}`}>
            <Image
              width={500}
              height={600}
              className="bg-img"
              alt="auth-banner"
              src="/auth-benner.png"
            />
          </div>

          <div className={`form_wrapper ${formType}`}>
            {formType === "login" && <Login />}
            {formType === "register-type" && <ChooseRegisterType />}
            <FormProvider {...methods}>
              {formType === "register" && <Register />}
              {formType === "registerOtp" && <RegisterOTPConfirm />}
            </FormProvider>
            <FormProvider {...companyFormMethods}>
              {formType === "register-company" && <RegisterCompany />}{" "}
              {formType === "companyOtp" && <CompanyOTPConfirm />}
            </FormProvider>
            <FormProvider {...forgetPassordMethods}>
              {formType === "forget" && <ForgetPassword />}

              {formType === "otp" && <OTPConfirm />}
            </FormProvider>
            {formType === "reset" && <ResetPassword />}
          </div>
        </section>
      </Modal.Body>
    </Modal>
  );
}
