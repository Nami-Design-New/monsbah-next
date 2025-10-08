import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { z } from "zod";

export const VERFICATION_Default_VALUES = {
  type: "person",
  country_id: "",
  phone: "",
  country_code: "965",
  category_id: "",
  document_type: "",
  file: undefined,
};
const personDocumentTypes = ["id", "passport", "license"];
const companyDocumentTypes = [
  "associationContract",
  "commercialRegister",
  "businessLicense",
];

const getSchema = (t) => {
  return z
    .object({
      type: z.enum(["person", "company"], {
        required_error: t("typeRequired"),
      }),

      country_id: z.string().min(1, { message: t("countryRequired") }),

      phone: z.string().min(1, { message: t("phoneRequired") }),

      country_code: z.string().min(1, { message: t("countryCodeRequired") }),

      category_id: z.string().min(1, { message: t("categoryRequired") }),

      document_type: z.string().min(1, { message: t("documentTypeRequired") }),

      file: z.any().refine((file) => file instanceof File, {
        message: t("fileRequired"),
      }),
    })
    .superRefine((data, ctx) => {
      if (
        data.type === "person" &&
        !personDocumentTypes.includes(data.document_type)
      ) {
        ctx.addIssue({
          path: ["document_type"],
          code: z.ZodIssueCode.custom,
          message: t("invalidDocumentTypeForPerson"),
        });
      }

      if (
        data.type === "company" &&
        !companyDocumentTypes.includes(data.document_type)
      ) {
        ctx.addIssue({
          path: ["document_type"],
          code: z.ZodIssueCode.custom,
          message: t("invalidDocumentTypeForCompany"),
        });
      }
    });
};

export default function useVerificationForm() {
  const t = useTranslations("validations");
  const methods = useForm({
    defaultValues: VERFICATION_Default_VALUES,
    resolver: zodResolver(getSchema(t)),
    mode: "onBlur",
  });

  return methods;
}
