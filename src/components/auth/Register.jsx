"use client";

import { useRegisterForm } from "@/hooks/controllers/useRegisterForm";
import useGetCities from "@/hooks/queries/settings/useGetCities";
import useGetCountries from "@/hooks/queries/settings/useGetCountries";
import useGetCurrentLocation from "@/hooks/queries/settings/useGetCurrentLocation";
import useGetStates from "@/hooks/queries/settings/useGetStates";
import { Link } from "@/i18n/navigation";
import { useAuthModal } from "@/stores/useAuthModal";
import InputField from "@/components/shared/forms/InputField";
import PasswordField from "@/components/shared/forms/PasswordField";
import PhoneInput from "@/components/shared/forms/PhoneInput";
import SelectField from "@/components/shared/forms/SelectField";
import SubmitButton from "@/components/shared/forms/SubmitButton";
import clientAxios from "@/libs/axios/clientAxios";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "sonner";
import { DevTool } from "@hookform/devtools";
import { Controller, useFormContext } from "react-hook-form";

const Register = () => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const { setFormType } = useAuthModal((state) => state);
  const { register, errors, handleSubmit, watch, control } = useFormContext();

  const { country_id, city_id } = watch();

  const [selectedCountry, setSelectedCountry] = useState(null);

  const { data: countries } = useGetCountries();
  const { data: cities, isLoading: citiesLoading } = useGetCities(
    country_id,
    country_id ? true : false
  );
  const { data: currentLocation } = useGetCurrentLocation();
  const { data: states, isLoading: areasLoading } = useGetStates(
    city_id,
    city_id ? true : false
  );

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
    const payload = { ...data, new_version: 1 };
    payload.phone = data.country_code + data.phone;

    try {
      const res = await clientAxios.post("/client/auth/sign-up", payload);
      if (res.status === 200) {
        toast.success(res.data?.message);
        setFormType("registerOtp");
      }
    } catch (error) {
      if (error.response?.data?.data) {
        const message = error.response?.data?.data
          ?.map((item) => `${item}<br />`)
          .join(" ");
        toast.error(
          <div
            style={{ textAlign: "start !important" }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        );
      } else {
        toast.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <p className="sub-head">{t("auth.registerSubtitle")}</p>
      </div>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form_group">
          <InputField
            label={t("auth.userName")}
            placeholder={t("auth.userNamePlaceHolder")}
            id="username"
            {...register("username")}
            error={errors?.username?.message}
          />

          <InputField
            label={t("auth.fullName")}
            placeholder={t("auth.fullName")}
            id="name"
            {...register("name")}
            error={errors?.name?.message}
          />

          <InputField
            label={t("auth.email")}
            placeholder={t("auth.email")}
            id="email"
            {...register("email")}
            error={errors?.email?.message}
          />
        </div>
        <div className="form_group">
          <SelectField
            label={t("auth.country")}
            id="country_id"
            name="country_id"
            {...register("country_id")}
            options={countries?.map((country) => ({
              name: country?.name,
              value: country?.id,
            }))}
            error={errors?.country_id?.message}
          />

          <SelectField
            loading={citiesLoading}
            loadingText={t("isLoading")}
            label={t("auth.city")}
            id="city_id"
            {...register("city_id")}
            options={cities?.map((city) => ({
              name: city?.name,
              value: city?.id,
            }))}
            error={errors?.city_id?.message}
          />

          <SelectField
            loading={areasLoading}
            loadingText={t("isLoading")}
            label={t("auth.area")}
            id="state_id"
            {...register("state_id")}
            options={states?.map((state) => ({
              name: state?.name,
              value: state?.id,
            }))}
            error={errors?.state_id?.message}
          />
        </div>
        <div className="form_group">
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
                onCountryChange={(country) =>
                  field.onChange(country?.country_code)
                }
                error={errors?.phone?.message}
              />
            )}
          />

          <div className="input-field">
            <label htmlFor="type">{t("auth.gender")}</label>
            <div className="radios">
              <label htmlFor="male">
                <input
                  type="radio"
                  id="male"
                  value="male"
                  {...register("gender")}
                />

                <span>{t("auth.male")}</span>
              </label>
              <label htmlFor="female">
                <input
                  type="radio"
                  id="female"
                  value="female"
                  {...register("gender")}
                />

                <span>{t("auth.female")}</span>
              </label>
            </div>{" "}
            {errors?.gender && (
              <Form.Control.Feedback type="invalid">
                {errors?.gender?.message}
              </Form.Control.Feedback>
            )}
          </div>
        </div>
        <div className="form_group">
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
        </div>
        <span className="noAccount mt-2">
          {t("auth.byContinueYouAccept")}{" "}
          <Link
            aria-label="Terms and Conditions"
            to="/terms-and-conditions"
            onClick={() => setShow(false)}
          >
            {t("tearmsAndConditions")}
          </Link>
        </span>
        <div className="d-flex gap-2">
          <button
            className="back_btn"
            onClick={() => setFormType("register-type")}
          >
            <i className="fal fa-arrow-right"></i>
          </button>
          <SubmitButton text={t("auth.register")} loading={loading} />
        </div>{" "}
        <DevTool control={control} />
      </form>
    </>
  );
};

export default Register;
