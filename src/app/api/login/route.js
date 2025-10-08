import { API_URL } from "@/utils/constants";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const t = await getTranslations();
  const cookieStore = cookies();
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());

  const endPoint = payload.endPoint || "/client/auth/login";
  delete payload.endPoint;

  try {
    const res = await fetch(`${API_URL}${endPoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    const response = NextResponse.json(data, { status: res.status });

    if (res.ok) {
      cookieStore.set("token", data?.data?.token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });

      cookieStore.set("user_type", data?.data?.client_data?.user_type, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      });
    }
    return response;
  } catch (e) {
    return NextResponse.json(
      { message: t("somethingWentWrong") },
      { status: 500 }
    );
  }
}
