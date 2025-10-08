"use client";

import useSettingForm from "@/hooks/controllers/useSettingForm";
import useGetCities from "@/hooks/queries/settings/useGetCities";
import useGetCountries from "@/hooks/queries/settings/useGetCountries";
import useGetCurrentLocation from "@/hooks/queries/settings/useGetCurrentLocation";
import useGetStates from "@/hooks/queries/settings/useGetStates";
import { updateProfileAction } from "@/libs/actions/profileActions";
import { extractPhoneFromCode } from "@/utils/helpers";
import { DevTool } from "@hookform/devtools";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import ImageUpload from "../shared/forms/ImageUpload";
import InputField from "../shared/forms/InputField";
import PhoneInput from "../shared/forms/PhoneInput";
import SelectField from "../shared/forms/SelectField";
import SubmitButton from "../shared/forms/SubmitButton";
import TextField from "../shared/forms/TextField";
import ChangePasswordModal from "./verification/ChangePasswordModal";

export default function SettingsTab({ user }) {
  const [showPasswordModal, setShowPasswordModal] = useState();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
    setValue,
  } = useSettingForm();

  const city_id = watch("city_id");
  const country_id = watch("country_id");

  const [selectedCountry, setSelectedCountry] = useState(null);
  const { data: countries } = useGetCountries();
  const { data: cities, isLoading: citiesLoading } = useGetCities(
    country_id,
    country_id ? true : false
  );

  useEffect(() => {
    reset({
      image: user?.image || "",
      cover: user?.cover || "",
      name: user?.name.toString() || "",
      username: user?.username.toString() || "",
      country_code: user?.country?.country_code.toString() || "965",
      phone:
        extractPhoneFromCode(
          user?.phone,
          user?.country?.country_code
        ).toString() || "",
      email: user?.email || "",
      country_id: user?.country?.id.toString() || "",
      city_id: user?.city?.id.toString() || "",
      state_id: user?.state?.id.toString() || "",
      about_ar: user?.about_ar || "",
      about_en: user?.about_en || "",
      fcm_token: user?.fcm_token || "",
    });
  }, [user]);

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
    const payload = { ...data };
    payload.phone = data.country_code + data.phone;

    try {
      const res = await updateProfileAction(payload);

      if (res.status === 200) {
        toast.success(res?.message);
      } else {
        toast.error(t("someThingWentWrong"));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "some Thing Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        className="form col-12 p-1 w-100 p-md-3 reverse-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUpload
              name="image"
              value={field.value}
              onChange={(file) => field.onChange(file)}
              coverValue={watch("cover")}
              onCoverChange={(file) => setValue("cover", file)}
              error={errors?.image}
              setValue={setValue}
            />
          )}
        />
        {(errors?.image || errors.cover) && (
          <p className="  fs-6 text-danger ">
            {errors?.image?.message}
            {errors?.image && errors.cover && "-"} {errors?.cover?.message}{" "}
          </p>
        )}
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
        </div>

        <div className="form_group">
          <Controller
            name="country_id"
            control={control}
            render={({ field }) => (
              <SelectField
                label={t("auth.country")}
                id="country_id"
                options={countries?.map((country) => ({
                  name: country?.name,
                  value: country?.id,
                }))}
                value={field.value}
                onChange={field.onChange}
                error={errors?.country_id?.message}
              />
            )}
          />
          <Controller
            name="city_id"
            control={control}
            render={({ field }) => (
              <SelectField
                loading={citiesLoading}
                loadingText={t("isLoading")}
                label={t("auth.city")}
                id="city_id"
                options={cities?.map((city) => ({
                  name: city?.name,
                  value: city?.id,
                }))}
                value={field.value}
                onChange={field.onChange}
                error={errors?.city_id?.message}
              />
            )}
          />
          <Controller
            name="state_id"
            control={control}
            render={({ field }) => (
              <SelectField
                loading={areasLoading}
                loadingText={t("isLoading")}
                label={t("auth.area")}
                id="state_id"
                options={states?.map((state) => ({
                  name: state?.name,
                  value: state?.id,
                }))}
                value={field.value}
                onChange={field.onChange}
                error={errors?.state_id?.message}
              />
            )}
          />
        </div>

        <div className="form_group">
          {" "}
          <InputField
            label={t("auth.email")}
            placeholder={t("auth.email")}
            id="email"
            {...register("email")}
            error={errors?.email?.message}
          />
          <Controller
            name="country_code"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label={
                  <div className=" w-100 d-flex align-items-center justify-content-between gap-2">
                    <div>
                      {t("auth.phone")}
                      <span style={{ color: "red", fontSize: "20px" }}> *</span>
                    </div>
                    <span
                      className="d-flex align-items-center justify-content-end"
                      style={{ cursor: "pointer", color: "#1abc9c" }}
                      onClick={() => setShowPhoneModal(true)}
                    >
                      {t("auth.doYouWantToChangePhone")}
                    </span>
                  </div>
                }
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
        </div>
        <div className="form_group">
          <TextField
            label={t("profile.aboutMe")}
            placeholder={t("writeHere")}
            id="about_ar"
            {...register("about_ar")}
            onChange={(e) => {
              setValue("about_ar", e.target.value);
              setValue("about_en", e.target.value);
            }}
            error={errors?.about_ar?.message}
          />
        </div>
        <div className="question p-0 pt-2">
          <label htmlFor="wantChangePassword" className="quest">
            {t("auth.doYouWantChangePassword")}
          </label>
          <Form.Switch
            id="wantChangePassword"
            name="wantChangePassword"
            checked={showPasswordModal}
            onChange={() => setShowPasswordModal(!showPasswordModal)}
          />
        </div>
        <SubmitButton text={t("save")} loading={loading} />
        <DevTool control={control} />
      </form>
      <ChangePasswordModal
        showModal={showPasswordModal}
        setShowModal={setShowPasswordModal}
      />
    </>
  );
}
