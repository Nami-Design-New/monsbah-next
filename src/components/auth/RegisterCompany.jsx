import { Link } from "@/i18n/navigation";
import ImageUpload from "@/components/shared/forms/ImageUpload";
import InputField from "@/components/shared/forms/InputField";
import PasswordField from "@/components/shared/forms/PasswordField";
import PhoneInput from "@/components/shared/forms/PhoneInput";
import SelectField from "@/components/shared/forms/SelectField";
import SubmitButton from "@/components/shared/forms/SubmitButton";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetCurrentLocation from "@/hooks/queries/settings/useGetCurrentLocation";
import { useAuthModal } from "@/stores/useAuthModal";
import useGetCountries from "@/hooks/queries/settings/useGetCountries";
import useGetCities from "@/hooks/queries/settings/useGetCities";
import useGetStates from "@/hooks/queries/settings/useGetStates";
import { DevTool } from "@hookform/devtools";
import useGetCategories from "@/hooks/queries/settings/useGetCategories";
import clientAxios from "@/libs/axios/clientAxios";
import { toast } from "sonner";

const RegisterCompany = () => {
  const { setFormType, onClose } = useAuthModal((state) => state);
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useFormContext();

  const city_id = watch("city_id");
  const country_id = watch("country_id");
  const avatar = watch("image");
  const cover = watch("cover");

  const [selectedCountry, setSelectedCountry] = useState(null);
  const { data: countries } = useGetCountries();
  const { data: cities, isLoading: citiesLoading } = useGetCities(
    country_id,
    country_id ? true : false
  );
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategories();
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
    payload.whats_number = data.whats_country_code + data.whats_number;

    try {
      const res = await clientAxios.post("/company/auth/sign-up", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        toast.success(res.data?.message);
        setFormType("companyOtp");
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
      <div className="mb-1">
        <p className="sub-head">{t("auth.registerSubtitle")}</p>
      </div>

      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <ImageUpload
          name="image"
          value={avatar}
          coverValue={cover}
          onChange={(file) => setValue("image", file, { shouldValidate: true })}
          onCoverChange={(file) =>
            setValue("cover", file, { shouldValidate: true })
          }
          error={errors?.image}
          setValue={setValue}
          uploadOnly={true}
        />

        <div className="form_group">
          <InputField
            label={t("auth.userName")}
            placeholder={t("auth.userNamePlaceHolder")}
            id="username"
            {...register("username")}
            error={errors?.username?.message}
          />

          <InputField
            label={t("auth.companyName")}
            placeholder={t("auth.companyName")}
            id="companyName"
            {...register("name_ar")}
            onChange={(e) => {
              setValue("name_ar", e.target.value);
              setValue("name_en", e.target.value);
            }}
            error={errors?.name_ar?.message}
          />

          <SelectField
            label={t("auth.category")}
            id="category_id"
            name="category_id"
            {...register("category_id")}
            options={categories?.map((c) => ({
              name: c?.name,
              value: c?.id,
            }))}
            error={errors?.category_id?.message}
          />
        </div>

        <div className="form_group">
          <SelectField
            label={t("auth.country")}
            id="country_id"
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
            {...register("city_id")}
            id="city_id"
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
          <Controller
            name="whats_country_code"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label={t("auth.whatsapp")}
                id="whats_number"
                placeholder={t("auth.whatsapp")}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                limit={selectedCountry?.number_limit}
                {...register("whats_number")}
                onCountryChange={(country) =>
                  field.onChange(country?.country_code)
                }
                error={errors?.whats_number?.message}
              />
            )}
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

        <div className="form_group">
          <InputField
            as={"textarea"}
            id="about"
            label={t("auth.companyDec")}
            placeholder={t("auth.enterDescription")}
            {...register("about_ar")}
            onChange={(e) => {
              setValue("about_ar", e.target.value);
              setValue("about_en", e.target.value);
            }}
          />
        </div>

        <span className="noAccount mt-2">
          {t("auth.byContinueYouAccept")}{" "}
          <Link
            aria-label="Terms and Conditions"
            to="/terms-and-conditions"
            onClick={() => onClose()}
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
        </div>
        <DevTool control={control} />
      </form>
    </>
  );
};

export default RegisterCompany;
