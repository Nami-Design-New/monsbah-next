"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

const DEFAULT_VALUES = {
  phone: "",
  password: "",
  country_code: "965",
  fcm_token: "",
};

const getSchecma = (t) => {
  return z.object({
    phone: z.string().nonempty(t("required")),
    password: z.string().min(6, t("password_too_short")),
    country_code: z.string().nonempty(),
    fcm_token: z.string().optional(),
  });
};

export default function useLoginForm() {
  const t = useTranslations("validations");

  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getSchecma(t)),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  return {
    register,
    watch,
    handleSubmit,
    control,
    errors,
  };
}
