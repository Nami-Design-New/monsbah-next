"use client";
import InputField from "@/components/shared/forms/InputField";
import SelectField from "@/components/shared/forms/SelectField";
import SubmitButton from "@/components/shared/forms/SubmitButton";
import TextField from "@/components/shared/forms/TextField";
import useAddAdForm from "@/hooks/controllers/useAddAdForm";
import useGetCategories from "@/hooks/queries/settings/useGetCategories";
import useGetCities from "@/hooks/queries/settings/useGetCities";
import useGetStates from "@/hooks/queries/settings/useGetStates";
import useGetSubCategories from "@/hooks/queries/settings/useGetSubCategories";
import {
  storeProductAction,
  submitProduct,
  updateProductAction,
} from "@/libs/actions/adsActions";
import { useAuthStore } from "@/stores/useAuthStore";
import { DevTool } from "@hookform/devtools";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import AdTypeSelector from "./AdTypeSelector";
import ProductContactOptions from "./ProductContactOptions";
import ProductImageGallery from "./ProductImageGallery";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function AddEditAdForm({ product }) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const productId = product?.id ?? null;

  const methods = useAddAdForm();
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  const queryClient = useQueryClient();
  const category_id = watch("category_id");
  const city_id = watch("city_id");
  const { user } = useAuthStore((state) => state);

  const { data: categories } = useGetCategories();

  const { data: subcategories, isLoading: subcategoriesLoading } =
    useGetSubCategories(category_id || 1, Boolean(category_id));

  const { data: cities } = useGetCities(
    user?.country?.id,
    Boolean(user?.country?.id)
  );
  const { data: areas, isLoading: areasLoading } = useGetStates(
    city_id,
    Boolean(city_id)
  );

  const onSubmit = async (formValues) => {
    setLoading(true);

    const res = await submitProduct(formValues, user, productId);

    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      router.replace("/profile/ads");
    }
    setLoading(false);
  };

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

  return (
    <FormProvider {...methods}>
      <div className="tab-content">
        <div className="tab-content-pane ">
          <form
            className="form col-12 p-2 p-md-3 reverse-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="row">
              <div className="col-12 p-2">
                <ProductImageGallery />
              </div>
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
              </div>
              <div className="col-12 col-md-6 p-2">
                <SelectField
                  label={`${t("ads.mainCategory")} *`}
                  id="category_id"
                  {...register("category_id")}
                  options={categories?.map((category) => ({
                    name: category?.name,
                    value: category?.id,
                  }))}
                  error={errors?.city_id?.message}
                />
              </div>
              <div className="col-12 col-md-6 p-2">
                <SelectField
                  label={`${t("ads.subCategory")} *`}
                  loadingText={t("isLoading")}
                  loading={subcategoriesLoading}
                  id="sub_category_id"
                  {...register("sub_category_id")}
                  options={subcategories?.map((subcategory) => ({
                    name: subcategory?.name,
                    value: subcategory?.id,
                  }))}
                  error={errors?.sub_category_id?.message}
                />
              </div>
              <div className="col-12 col-md-6 p-2">
                <InputField
                  label={t("ads.price")}
                  placeholder={t("ads.priceNote")}
                  id="price"
                  {...register("price")}
                  error={errors?.price?.message}
                />
              </div>
              <div className="col-12 col-md-6 p-2">
                <AdTypeSelector />
              </div>
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
              </div>
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
            <DevTool control={control} />
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
