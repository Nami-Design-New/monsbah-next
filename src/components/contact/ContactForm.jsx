"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import InputField from "@/components/shared/forms/InputField";
import PhoneInput from "@/components/shared/forms/PhoneInput";
import SubmitButton from "@/components/shared/forms/SubmitButton";
import useContactForm from "@/hooks/controllers/useContactForm";
import useGetCurrentLocation from "@/hooks/queries/settings/useGetCurrentLocation";
import { Controller } from "react-hook-form";
import { contactAction } from "@/libs/actions/contactActions";
import { toast } from "sonner";

export default function ContactForm() {
  const t = useTranslations("contact");
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useContactForm(10);
  const { data: currentLocation } = useGetCurrentLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

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
    setIsLoading(true);
    const res = await contactAction(data);
    if (!res.success) {
      toast.error(res?.message);
    } else {
      reset();
      toast.success(t("messageSentSuccessfully"));
    }
  };

  return (
    <div className="col-lg-6 p-2">
      <div className="contact_form">
        <h3>{t("sendMessage")}</h3>
        <p>{t("sendSubtitle")}</p>

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="row m-0">
            <div className="col-12 p-2">
              <InputField
                required
                type="text"
                name="name"
                placeholder={t("name")}
                {...register("name")}
                error={errors?.name?.message}
              />
            </div>
            <div className="col-lg-6 col-12 p-2">
              <Controller
                name="country_code"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label={t("phone")}
                    id="phone"
                    placeholder={t("phone")}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    limit={selectedCountry?.number_limit}
                    {...register("phone")}
                    onCountryChange={(country) =>
                      field.onChange(country?.country_code)
                    }
                    error={errors?.phone?.message}
                  />
                )}
              />
            </div>
            <div className="col-lg-6 col-12 p-2">
              <InputField
                label={t("email")}
                placeholder={t("email")}
                id="email"
                name="email"
                type="email"
                {...register("email")}
                error={errors?.email?.message}
              />
            </div>
            <div className="col-12 p-2">
              <InputField
                required
                placeholder={t("message")}
                name="message"
                id="message"
                as="textarea"
                {...register("message")}
                error={errors?.message?.message}
              />
            </div>
            <div className="col-12 p-2 d-flex justify-content-center">
              <SubmitButton
                text={t("send")}
                className={"contact_btn mt-3"}
                // loading={}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
