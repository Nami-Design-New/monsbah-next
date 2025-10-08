import { cookies } from "next/headers";

export async function getUserType() {
  const cookiesStore = await cookies();
  const rawType = cookiesStore.get("user_type")?.value;

  switch (rawType) {
    case "user":
      return "client";
    case "company":
      return "company";
    default:
      return "client";
  }
}
