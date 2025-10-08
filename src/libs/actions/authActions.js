"use server";

import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import serverAxios from "../axios/severAxios";
import { FCM } from "@/utils/constants";
import { revalidatePath } from "next/cache";

export async function loginAction({
  userType,
  country_code,
  phone,
  password,
  fcm_token = "",
}) {
  const t = await getTranslations();
  const cookieStore = cookies();
  const endPoint =
    userType === "company" ? "/company/auth/login" : "/client/auth/login";
  const fullPhone = country_code + phone;

  const payload = {
    password,
    phone: fullPhone,
    country_code,
    fcm_token: FCM,
  };

  try {
    const res = await serverAxios.post(endPoint, payload);
    if (res.status === 200) {
      cookieStore.set("token", res?.data?.data?.token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });

      cookieStore.set("user_type", res?.data?.data?.client_data?.user_type, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });
      revalidatePath("/");
      return {
        success: true,
        message: res.data.message,
        data: res?.data?.data,
      };
    } else {
      return {
        success: false,
        message: "internal server error",
      };
    }
  } catch (e) {
    return {
      success: false,
      message: e.response.data.message,
    };
  }
}
