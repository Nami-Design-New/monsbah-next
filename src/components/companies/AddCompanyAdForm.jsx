"use client";

import useAddCompanyAdForm from "@/hooks/controllers/useAddCompanyAdForm";
import useGetCities from "@/hooks/queries/settings/useGetCities";
import useGetStates from "@/hooks/queries/settings/useGetStates";
import useGetSubCategories from "@/hooks/queries/settings/useGetSubCategories";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useTranslations } from "use-intl";
import ProductContactOptions from "../profile/ads/ProductContactOptions";
import ProductImageGallery from "../profile/ads/ProductImageGallery";
import InputField from "../shared/forms/InputField";
import SelectField from "../shared/forms/SelectField";
import SubmitButton from "../shared/forms/SubmitButton";
import TextField from "../shared/forms/TextField";
import { toast } from "sonner";
import { submitCompanyProduct } from "@/libs/actions/adsActions";

export default function AddCompanyAdForm({ user, product }) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const productId = product?.id ?? null;
  const router = useRouter();
  const methods = useAddCompanyAdForm();
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  const city_id = watch("city_id");
  const { data: subcategories, isLoading: subcategoriesLoading } =
    useGetSubCategories(user?.category?.id, Boolean(user?.category?.id));

  const { data: cities } = useGetCities(
    user?.country?.id,
    Boolean(user?.country?.id)
  );
  const { data: areas, isLoading: areasLoading } = useGetStates(
    city_id,
    Boolean(city_id)
  );

  useEffect(() => {
    if (product?.id) {
      let images = product.images || [];

      if (images.length === 0 && product.image) {
        images = [product.image];
      }

      reset({
        name_ar: product.name,
        name_en: product.name,
        price: product.price.toString(),
        category_id: product.category_id.toString(),
        sub_category_id: product.sub_category_id.toString(),
        country_id: product?.country?.id.toString(),
        city_id: product?.city?.id.toString(),
        state_id: product?.state?.id.toString(),
        description_ar: product.description,
        description_en: product.description,
        type: product?.type,
        active_chat: product?.active_chat,
        active_whatsapp: product?.active_whatsapp,
        active_call: product?.active_call,
        image: product?.image,
        images,
      });
    }
  }, [product, reset]);

  const onSubmit = async (formValues) => {
    setLoading(true);

    const res = await submitCompanyProduct(formValues, user, productId);
    if (!res?.success) {
      toast.error(res?.data?.message);
    } else {
      toast.success(res?.data?.message);
      router.replace("/company-profile");
      reset();
    }

    setLoading(false);
  };

  return (
    <FormProvider {...methods}>
      {" "}
      <div className="tab-content">
        <div className="tab-content-pane ">
          <form
            className="form col-12 p-2 p-md-3 reverse-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="row">
              <div className="col-12  p-2">
                <ProductImageGallery />
              </div>{" "}
              <div className="col-12  p-2">
                <InputField
                  label={t("ads.name")}
                  placeholder={t("ads.nameNote")}
                  id="name_ar"
                  {...register("name_ar")}
                  onChange={(e) => {
                    setValue("name_ar", e.target.value);
                    setValue("name_en", e.target.value);
                  }}
                  error={errors?.name_ar?.message}
                />
              </div>{" "}
              <div className="col-12 col-md-6 p-2">
                <SelectField
                  label={`${t("category")} *`}
                  id="sub_category_id"
                  {...register("sub_category_id")}
                  options={subcategories?.map((subcategory) => ({
                    name: subcategory?.name,
                    value: subcategory?.id,
                  }))}
                  error={errors?.city_id?.message}
                />
              </div>{" "}
              <div className="col-12 col-md-6 p-2">
                <InputField
                  label={t("ads.price")}
                  placeholder={t("ads.priceNote")}
                  id="price"
                  {...register("price")}
                  error={errors?.price?.message}
                />
              </div>{" "}
              <div className="col-12 col-md-6 p-2">
                <SelectField
                  label={`${t("ads.city")} *`}
                  id="city_id"
                  name="city_id"
                  {...register("city_id")}
                  options={cities?.map((city) => ({
                    name: city?.name,
                    value: city?.id,
                  }))}
                  error={errors?.city_id?.message}
                />
              </div>
              <div className="col-12 col-md-6 p-2">
                <SelectField
                  label={`${t("ads.area")} *`}
                  loading={areasLoading}
                  loadingText={t("isLoading")}
                  id="state_id"
                  {...register("state_id")}
                  options={areas?.map((area) => ({
                    name: area?.name,
                    value: area?.id,
                  }))}
                  error={errors?.state_id?.message}
                />
              </div>{" "}
              <div className="col-12 p-2">
                <TextField
                  label={t("ads.description")}
                  placeholder={t("ads.descriptionPlaceholder")}
                  id="description_ar"
                  {...register("description_ar")}
                  onChange={(e) => {
                    setValue("description_ar", e.target.value);
                    setValue("description_en", e.target.value);
                  }}
                  error={errors?.description_ar?.message}
                />
              </div>
              <ProductContactOptions />
            </div>
            <div className="col-12 p-2">
              <SubmitButton text={t("add")} loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
