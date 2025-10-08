import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const getSchema = (t, numberLimit) => {
  return z.object({
    name: z.string().nonempty(t("required")).min(2, t("name_too_short")),
    email: z.string().email(t("invalid_email")),
    phone: z
      .string()
      .nonempty(t("required"))
      .min(numberLimit, t("invalid_phone")),
    message: z.string().nonempty(t("required")).min(10, t("message_too_short")),
  });
};
export default function useContactForm(numberLimit = 10) {
  const t = useTranslations("validations");

  const methods = useForm({
    resolver: zodResolver(getSchema(t, numberLimit)),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  return methods;
}
