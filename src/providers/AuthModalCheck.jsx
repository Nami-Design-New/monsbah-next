"use client";
import { useAuthModal } from "@/stores/useAuthModal";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCheck() {
  const searchParams = useSearchParams();
  const { onOpen } = useAuthModal((state) => state);
  useEffect(() => {
    if (searchParams.get("authModal") === "true") {
      onOpen(true);
    }
  }, [searchParams]);

  return null;
}
