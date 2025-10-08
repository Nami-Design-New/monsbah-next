import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const DEFAULT_VALUES = {
  password: "",
  password_confirmation: "",
};

const getSchema = (t) => {
  return z
    .object({
      password: z.string().min(6, t("passwordTooShort")),
      password_confirmation: z.string().min(6, t("passwordTooShort")),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("passwordsDoNotMatch"),
      path: ["password_confirmation"],
    });
};

export const useResetPasswardForm = () => {
  const t = useTranslations("validations");
  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
    mode: "onchange",
    resolver: zodResolver(getSchema(t)),
  });
  return methods;
};
