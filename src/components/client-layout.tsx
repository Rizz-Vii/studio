"use client";

import { UIProvider } from "@/context/UIContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import SiteFooter from "@/components/site-footer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      {children}
      <Toaster />
      <SonnerToaster position="top-right" richColors />
      <SiteFooter />
    </UIProvider>
  );
}
