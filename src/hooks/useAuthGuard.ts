// src/hooks/useAuthGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Hook to redirect authenticated users away from auth pages
 * Use on login/register pages to prevent logged-in users from accessing them
 */
export function useAuthGuard(redirectTo: string = "/dashboard") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect them away from auth pages
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading, shouldRender: !loading && !user };
}

/**
 * Hook for smart homepage redirects
 * Optionally redirects logged-in users to dashboard
 */
export function useSmartHomepage(autoRedirect: boolean = false) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (autoRedirect && !loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router, autoRedirect]);

  return { user, loading, isLoggedIn: !!user };
}
