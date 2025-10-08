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
  return z.object({
    username: z.string().min(1, t("username")),
    name: z.string().min(1, t("name_ar")),
    phone: z.string().min(8, t("min_phone")),
    email: z.string().email(t("invalid_email")),
    city_id: z.string().min(1, t("city_id")),
    state_id: z.string().min(1, t("state_id")),
    about_ar: z.string().optional(),
    about_en: z.string().optional(),
    country_id: z.string().min(1, t("country_id")),
    country_code: z.string().min(1, t("country_code")),
    fcm_token: z.string().optional(),
    image: z
      .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
      .refine(
        (file) => {
          if (file instanceof File) {
            return file.size <= MAX_FILE_SIZE;
          }
          return true;
        },
        {
          message: t("image_too_large"),
        }
      )
      .refine(
        (file) => {
          if (file instanceof File) {
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
          }
          return true;
        },
        {
          message: t("invalid_image_type"),
        }
      ),

    cover: z
      .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
      .refine(
        (file) => {
          if (file instanceof File) {
            return file.size <= MAX_FILE_SIZE;
          }
          return true;
        },
        {
          message: t("cover_too_large"),
        }
      )
      .refine(
        (file) => {
          if (file instanceof File) {
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
          }
          return true;
        },
        {
          message: t("invalid_cover_type"),
        }
      ),
  });
};

export default function useSettingForm() {
  const t = useTranslations("validations");
  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(getSchema(t)),
    mode: "onBlur",
  });

  return methods;
}
