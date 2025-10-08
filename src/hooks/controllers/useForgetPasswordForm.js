import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const DEFAULT_VALUES = { phone: "", country_code: "965" };

const getschema = (t) => {
  return z.object({
    phone: z.string().nonempty(t("required")),
    country_code: z.string().nonempty(t("required")),
  });
};

export const useForgetPasswordForm = () => {
  const t = useTranslations("validations");
  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
    resolver: zodResolver(getschema(t)),
  });

  return methods;
};
