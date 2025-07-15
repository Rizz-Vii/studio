"use client";

import { UIProvider } from "@/context/UIContext";
import { Toaster } from "@/components/ui/toaster";
import SiteFooter from "@/components/site-footer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      {children}
      <Toaster />
      <SiteFooter />
    </UIProvider>
  );
}
