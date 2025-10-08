"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export function useDeleteSearchParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthModalOpen = searchParams.has("authModal");
  const closeAuthModal = () => {
    if (isAuthModalOpen) {
      const params = new URLSearchParams(searchParams);
      params.delete("authModal");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return { isAuthModalOpen, closeAuthModal };
}
