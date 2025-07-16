"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/loading-screen";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Only import and use Firebase auth on the client side
        if (typeof window !== 'undefined') {
          const { auth } = await import("@/lib/firebase");
          await auth.signOut();
        }
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        // Ensure redirection happens even if signOut fails for some reason
        router.push("/");
      }
    };

    performLogout();
  }, [router]);

  return <LoadingScreen fullScreen text="Logging out..." />;
}