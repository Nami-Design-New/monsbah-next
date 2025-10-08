import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import SubmitButton from "../shared/forms/SubmitButton";
import PhoneInput from "../shared/forms/PhoneInput";
import { useAuthModal } from "@/stores/useAuthModal";
import useGetCurrentLocation from "@/hooks/queries/settings/useGetCurrentLocation";
import { useTranslations } from "use-intl";
import clientAxios from "@/libs/axios/clientAxios";
import { toast } from "sonner";

const ForgetPassword = () => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { setFormType, userType } = useAuthModal((state) => state);
  const { data: currentLocation } = useGetCurrentLocation();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const {
    register,
    watch,
    control,
    formState: errors,
    handleSubmit,
  } = useFormContext();

  useEffect(() => {
    if (currentLocation) {
      setSelectedCountry(currentLocation);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (selectedCountry) {
      register("country_code", {
        required: true,
        value: selectedCountry.country_code,
      });
    }
  }, [selectedCountry]);

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      phone: data.country_code + data.phone,
      country_code: data.country_code,
    };
    try {
      const res = await clientAxios.post(
        `/${userType}/auth/forget-password`,
        payload
      );
      if (res.status === 200) {
        toast.success(res.data?.message);

        setFormType("otp");

        // const updatedParams = new URLSearchParams(searchParams);
        // updatedParams.delete("redirect");
        // setSearchParams(updatedParams);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      {" "}
      <div className="mb-4">
        <h2 className="head">{t("auth.resetPasswordTitle")} </h2>
        <p className="sub-head">{t("auth.resetPasswordSubtitle")}</p>
      </div>
      <Controller
        name="country_code"
        control={control}
        render={({ field }) => (
          <PhoneInput
            label={t("auth.phone")}
            id="phone"
            placeholder={t("auth.phone")}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            limit={selectedCountry?.number_limit}
            {...register("phone")}
            onCountryChange={(country) => field.onChange(country?.country_code)}
            error={errors?.phone?.message}
          />
        )}
      />
      <div className="d-flex align-items-center gap-2">
        <button
          aria-label="Back"
          className="back_btn"
          onClick={(e) => {
            e.preventDefault();
            setFormType("login");
          }}
        >
          <i className="fal fa-arrow-right"></i>
        </button>
        <SubmitButton text={t("send")} loading={loading} />
      </div>
    </form>
  );
};

export default ForgetPassword;
