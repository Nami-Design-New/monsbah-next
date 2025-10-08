"use cleint";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { z } from "zod";

export const getSchema = (t) => {
  return z
    .object({
      old_password: z.string().min(6, t("oldPasswordRequired")),
      password: z.string().min(6, t("passwordMin")),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ["password_confirmation"],
      message: t("passwordsDoNotMatch"),
    });
};

export default function useChangePasswordForm() {
  const t = useTranslations("validations");
  const methods = useForm({
    resolver: zodResolver(getSchema(t)),
    defaultValues: {
      old_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  return methods;
}
