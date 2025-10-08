import { CATEGORY_TYPES } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const DEFAULT_VALUES = {
  name_ar: "",
  name_en: "",
  price: "",
  category_id: "",
  sub_category_id: "",
  city_id: "",
  state_id: "",
  phone: "",
  country_code: "965",
  currency_id: "",
  description_ar: "",
  description_en: "",
  type: CATEGORY_TYPES.SALE,
  active_chat: "inactive",
  active_whatsapp: "inactive",
  active_call: "inactive",
  image: null,
  images: [],
};

export const getSchema = (t) =>
  z
    .object({
      name_ar: z
        .string()
        .nonempty(t("name_ar_required"))
        .refine(
          (val) => val.trim().split(/\s+/).length <= 5,
          t("name_word_limit")
        ),

      name_en: z
        .string()
        .nonempty(t("name_en_required"))
        .refine(
          (val) => val.trim().split(/\s+/).length <= 5,
          t("name_word_limit")
        ),

      price: z.preprocess(
        (val) => (typeof val === "string" ? val.trim() : val),
        z.string().min(1, t("price_required"))
      ),

      sub_category_id: z
        .union([z.string(), z.number()], {
          required_error: t("subcategory_required"),
        })
        .refine((val) => val !== "", { message: t("subcategory_required") }),

      // ✅ Required state & city
      state_id: z
        .union([z.string(), z.number()], {
          required_error: t("state_required"),
        })
        .refine((val) => val !== "", { message: t("state_required") }),

      city_id: z
        .union([z.string(), z.number()], {
          required_error: t("city_required"),
        })
        .refine((val) => val !== "", { message: t("city_required") }),

      country_id: z.union([z.string(), z.number()]).optional(),

      newPhoneNumber: z.boolean().default(false),

      phone: z.string().optional(),
      country_code: z.string().optional(),

      currency_id: z.union([z.string(), z.number()]).optional(),

      description_ar: z.string().min(1, t("description_ar_required")),
      description_en: z.string().min(1, t("description_en_required")),

      // ✅ Required type (already handled)
      type: z.enum(["sale", "rent"], {
        required_error: t("type_required"),
      }),

      active_chat: z.enum(["active", "inactive"], {
        required_error: t("chat_status_required"),
      }),
      active_whatsapp: z.enum(["active", "inactive"], {
        required_error: t("whatsapp_status_required"),
      }),
      active_call: z.enum(["active", "inactive"], {
        required_error: t("call_status_required"),
      }),

      image: z.any().optional(),

      // ✅ Make images required with at least 1 file
      images: z
        .array(z.any(), {
          required_error: t("images_required"),
          invalid_type_error: t("images_required"),
        })
        .min(1, t("images_required"))
        .max(6, t("max_images_error")),

      delete_images: z.array(z.any()).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.newPhoneNumber) {
        if (!data.phone || data.phone.trim().length < 5) {
          ctx.addIssue({
            path: ["phone"],
            code: z.ZodIssueCode.custom,
            message: t("phone_required"),
          });
        }

        if (!data.country_code || data.country_code.trim() === "") {
          ctx.addIssue({
            path: ["country_code"],
            code: z.ZodIssueCode.custom,
            message: t("country_code_required"),
          });
        }
      }
    });

export default function useAddCompanyAdForm() {
  const t = useTranslations("validations");

  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(getSchema(t)),
    mode: "onBlur",
  });

  return methods;
}
