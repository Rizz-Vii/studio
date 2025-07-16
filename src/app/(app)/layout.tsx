// src/app/(app)/layout.tsx
"use client";

import { FeedbackToast, GlobalLoadingIndicator, ScrollArea, MainPanel, TopLoader } from '@/components/ui';
import { HydrationProvider } from '@/components/HydrationContext';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent } from '@/components/ui/sidebar';
import { AppLogo, AppName } from '@/constants/nav';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/loading-screen';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppNav from '@/components/app-nav';
import MobileNav from '@/components/mobile-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useProtectedRoute();

  if (loading || !user) {
    return <LoadingScreen fullScreen />;
  }

  return (
      <HydrationProvider>
        <SidebarProvider defaultOpen={true}>
          {/* Mobile Navigation */}
          <div className="fixed top-4 left-4 z-50 md:hidden">
            <MobileNav />
          </div>
          
          <div className="flex h-screen w-screen bg-background">
            <Sidebar>
              <SidebarHeader className="p-4 flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2 group-data-[state=collapsed]:justify-center"
                >
                  <AppLogo className="h-8 w-8 text-primary shrink-0" />
                  <span className="text-2xl font-headline font-bold text-primary group-data-[state=collapsed]:hidden">
                    {AppName}
                  </span>
                </Link>
              </SidebarHeader>
              <SidebarContent>
                <ScrollArea className="h-full">
                  <AppNav />
                </ScrollArea>
              </SidebarContent>
            </Sidebar>
            <MainPanel>{children}</MainPanel>
          </div>
          <FeedbackToast />
          <GlobalLoadingIndicator />
          <TopLoader />
        </SidebarProvider>
      </HydrationProvider>
  );
}
