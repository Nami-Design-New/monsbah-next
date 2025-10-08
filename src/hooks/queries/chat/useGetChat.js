"use client";
import clientAxios from "@/libs/axios/clientAxios";
import { useAuthModal } from "@/stores/useAuthModal";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function useGetChat() {
  const lang = useLocale().split("-")[1];
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id");
  const { useType } = useAuthModal((state) => state);

  const { isLoading, data, error } = useQuery({
    queryKey: ["chat", lang, userId],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(`/client/chat/details`, {
          params: {
            user_id: userId,
            user_type: useType === "client" ? "user" : "company",
          },
        });
        if (res.status === 200) {
          return res.data.data || {};
        }
      } catch (error) {
        console.error("Error fetching product:", error.message);
        throw error;
      }
    },
    enabled: Boolean(userId),
  });
  return { isLoading, data, error };
}
