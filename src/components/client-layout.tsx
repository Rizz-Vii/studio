"use client";

import { PerformanceIndicator, WebVitalsMonitor } from "@/components/performance/web-vitals-monitor";
import SiteFooter from "@/components/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { UIProvider } from "@/context/UIContext";
import { Toaster as SonnerToaster } from "sonner";

export function ClientLayout({ children }: { children: React.ReactNode; }) {
  return (
    <UIProvider>
      {children}
      <Toaster />
      <SonnerToaster position="top-right" richColors />
      <SiteFooter />
      <WebVitalsMonitor />
      <PerformanceIndicator />
    </UIProvider>
  );
}
