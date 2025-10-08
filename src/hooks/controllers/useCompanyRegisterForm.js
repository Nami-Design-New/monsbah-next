import { FCM } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg",
];

const DEFAULT_VALUES = {
  username: "",
  name_ar: "",
  name_en: "",
  phone: "",
  email: "",
  password: "",
  city_id: "",
  state_id: "",
  about_ar: "",
  about_en: "",
  country_id: "",
  category_id: "",
  whats_number: "",
  country_code: "965",
  whats_country_code: "",
  password_confirmation: "",
  fcm_token: FCM,
  image: null,
  cover: null,
};

const getSchema = (t) => {
  return z
    .object({
      username: z.string().min(1, t("username")),
      name_ar: z.string().min(1, t("name_ar")),
      name_en: z.string().min(1, t("name_en")),
      phone: z.string().min(8, t("min_phone")),
      email: z.string().email(t("invalid_email")),
      password: z.string().min(6, t("min_password")),
      password_confirmation: z.string().min(6, t("password_confirmation")),
      city_id: z.string().min(1, t("city_id")),
      state_id: z.string().min(1, t("state_id")),
      about_ar: z.string().optional(),
      about_en: z.string().optional(),
      country_id: z.string().min(1, t("country_id")),
      category_id: z.string().min(1, t("category_id")),
      whats_number: z.string().min(8, t("min_whatsapp")),
      country_code: z.string().min(1, t("country_code")),
      whats_country_code: z.string().min(1, t("whats_country_code")),
      fcm_token: z.string().min(1, t("fcm_token")),
      image: z
        .custom((file) => file instanceof File, {
          message: t("image_required"),
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
          message: t("image_too_large"),
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message: t("invalid_image_type"),
        }),

      cover: z
        .custom((file) => file === null || file instanceof File)
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
          message: t("cover_too_large"),
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message: t("invalid_cover_type"),
        })
        .nullable(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("password_mismatch"),
      path: ["password_confirmation"],
    });
};

const useCompanyRegisterForm = () => {
  const t = useTranslations("validations");

  const methods = useForm({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(getSchema(t)),
  });

  return methods;
};

export default useCompanyRegisterForm;
