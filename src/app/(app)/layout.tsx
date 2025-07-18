// src/app/(app)/layout.tsx
"use client";

import { FeedbackToast, GlobalLoadingIndicator, ScrollArea, MainPanel, TopLoader } from '@/components/ui';
import { HydrationProvider } from '@/components/HydrationContext';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { AppLogo, AppName } from '@/constants/nav';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/loading-screen';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppNav from '@/components/app-nav';
import MobileNav from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useProtectedRoute();
  const { user, role } = useAuth();

  if (authLoading || !authUser) {
    return <LoadingScreen fullScreen />;
  }

  return (
      <HydrationProvider>
        <SidebarProvider defaultOpen={true}>
          {/* Mobile Navigation Header */}
          <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between p-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <AppLogo className="h-8 w-8 text-primary shrink-0" />
                <span className="text-xl font-headline font-bold text-primary">
                  {AppName}
                </span>
              </Link>
              <MobileNav />
            </div>
          </div>
          
          <div className="flex h-screen w-screen bg-background pt-16 md:pt-0">
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
              
              {/* Desktop User Menu Footer */}
              <SidebarFooter className="p-4 border-t">
                <div className="space-y-2">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">
                        {user?.email?.[0].toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
                      <p className="text-sm font-medium truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {role === "admin" ? "Administrator" : "User"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-1">
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start h-9 group-data-[state=collapsed]:justify-center"
                    >
                      <Link href="/profile" className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        <span className="group-data-[state=collapsed]:hidden">Profile</span>
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start h-9 text-red-600 hover:text-red-700 hover:bg-red-50 group-data-[state=collapsed]:justify-center"
                    >
                      <Link href="/logout" className="flex items-center gap-3">
                        <LogOut className="h-4 w-4" />
                        <span className="group-data-[state=collapsed]:hidden">Sign Out</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </SidebarFooter>
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
