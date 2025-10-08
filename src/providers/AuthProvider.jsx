"use client";
import { useAuthModal } from "@/stores/useAuthModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLayoutEffect } from "react";

export default function AuthProvider({ children }) {
  const loginInState = useAuthStore((state) => state.login);
  const { setUserType } = useAuthModal((state) => state);

  useLayoutEffect(() => {
    async function getUser() {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data?.token && data?.user) {
        loginInState(data.token, data.user);

        if (data?.user?.client) {
          setUserType(data?.user?.client?.user_type);
        } else {
          setUserType(data?.user?.user_type === "user" && "client");
        }
      }
    }
    getUser();
  }, [loginInState]);

  return children;
}
