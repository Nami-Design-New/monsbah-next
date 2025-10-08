"use client";

import PhoneInput from "@/components/shared/forms/PhoneInput";
import SelectField from "@/components/shared/forms/SelectField";
import SubmitButton from "@/components/shared/forms/SubmitButton";
import useVerificationForm, {
  VERFICATION_Default_VALUES,
} from "@/hooks/controllers/useVerificationForm";
import useGetCurrentLocation from "@/hooks/queries/settings/useGetCurrentLocation";
import { useRouter } from "@/i18n/navigation";
import { verificationAction } from "@/libs/actions/verificationAction";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

export default function VerificationTab({ countries, categories }) {
  const t = useTranslations();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [idLoading, setIsLoading] = useState(false);
  const { data: currentLocation } = useGetCurrentLocation();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useVerificationForm();

  const type = watch("type");
  const file = watch("file");
  const countryCode = watch("country_code");

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
    try {
      const response = await verificationAction(data);
      toast.success(t("subscripedSuccessfully"));
      reset(VERFICATION_Default_VALUES);
      router.push("/profile");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="form col-12 p-2 p-md-3 reverse-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="form_group">
        <div className="input-field">
          <label htmlFor="type">{t("verification.type")} *</label>
          <div className="radios">
            <label htmlFor="person">
              <input
                type="radio"
                id="person"
                value="person"
                {...register("type")}
              />
              <span>{t("verification.person")}</span>
            </label>
            <label htmlFor="company">
              <input
                type="radio"
                id="company"
                value="company"
                {...register("type")}
              />
              <span>{t("verification.company")}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 col-12 d-flex flex-column gap-3 mb-3">
          <div className="form_group">
            <SelectField
              label={`${t("verification.country")} *`}
              id="country_id"
              {...register("country_id")}
              options={countries?.map((c) => ({
                name: c.name,
                value: c.id,
              }))}
              error={errors?.country_id?.message}
            />
          </div>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <PhoneInput
                label={`${t("verification.phone")} *`}
                id="phone"
                value={value}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                onChange={(e) => onChange(e.target.value)}
                onCountryChange={(country) => {
                  setValue("country_code", country.country_code);
                }}
                error={error?.message}
              />
            )}
          />

          <SelectField
            label={`${t("verification.category")} *`}
            id="category_id"
            {...register("category_id")}
            options={categories?.map((cat) => ({
              name: cat.name,
              value: cat.id,
            }))}
            error={errors.category_id?.message}
          />
        </div>

        <div className="col-lg-6 col-12 d-flex flex-column gap-3 mb-3">
          <div className="col-12 field-header">
            <h6 className="title">
              {t("verification.verificationConfirmationTitle")}:
            </h6>
            <span className="subTitle">
              {t("verification.verificationConfirmationSubtitle")}
            </span>
          </div>

          <div className="form_group">
            <SelectField
              label={`${t("verification.docoumentType")} *`}
              id="document_type"
              {...register("document_type")}
              options={
                type === "person"
                  ? [
                      { name: t("verification.id"), value: "id" },
                      { name: t("verification.passport"), value: "passport" },
                      { name: t("verification.license"), value: "license" },
                    ]
                  : [
                      {
                        name: t("verification.associationContract"),
                        value: "associationContract",
                      },
                      {
                        name: t("verification.commercialRegister"),
                        value: "commercialRegister",
                      },
                      {
                        name: t("verification.businessLicense"),
                        value: "businessLicense",
                      },
                    ]
              }
              error={errors.document_type?.message}
            />
          </div>

          <div className="input-field">
            <label htmlFor="file">{t("verification.uploadDocument")} *</label>
            <label className="image_upload">
              <input
                type="file"
                id="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setValue("file", file);
                }}
              />
              {file ? (
                <>
                  <img
                    src={URL.createObjectURL(file)}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                    }}
                    alt="upload"
                  />
                  <button
                    aria-label="Remove"
                    onClick={(e) => {
                      e.preventDefault();
                      setValue("file", undefined);
                    }}
                  >
                    <i className="fa-light fa-xmark"></i>
                  </button>
                </>
              ) : (
                <img src="/icons/gallery.svg" alt="upload" />
              )}
            </label>
            {errors.file && (
              <p className="text-danger">{errors.file.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SubmitButton loading={isSubmitting} text={t("verification.verify")} />
      </div>
    </form>
  );
}
