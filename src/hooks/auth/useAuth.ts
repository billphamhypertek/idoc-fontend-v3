"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "~/stores/auth.store";

export function useAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo || "/login");
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuth(redirectTo);

  return { isAuthenticated, isLoading };
}
