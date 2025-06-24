// src/app/(app)/layout.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { navItems, AppLogo, AppName } from '@/constants/nav';
import type { NavItem } from '@/constants/nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/ui/loading-screen';
import useProtectedRoute from '@/hooks/useProtectedRoute';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2 md:hidden">
        <h1 className="text-xl font-headline font-semibold">{AppName}</h1>
      </div>
    </header>
  );
};

const UserNav = () => {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { open, setOpen, isMobile, setUserMenuOpen } = useSidebar();
  const [openedByMe, setOpenedByMe] = React.useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setUserMenuOpen(isOpen);
    if (isMobile) {
        return;
    }
    if (isOpen) {
      if (!open) {
        setOpenedByMe(true);
        setOpen(true);
      }
    } else {
      if (openedByMe) {
        setOpenedByMe(false);
        setOpen(false);
      }
    }
  };

  const userInitial = user ? (profile?.displayName || user.email || 'U').charAt(0).toUpperCase() : '';

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg p-2 text-left text-sm group-data-[state=collapsed]:h-12 group-data-[state=collapsed]:w-12 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="group-data-[state=collapsed]:hidden">
            <p className="max-w-[7rem] truncate font-medium">
              {profile?.displayName || user?.email}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={12}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
           <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
           </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface AppNavProps {
  setIsNavigating: (isNavigating: boolean) => void;
}

const AppNav: React.FC<AppNavProps> = ({ setIsNavigating }) => {
    const pathname = usePathname();
    const { open } = useSidebar();
    const { role } = useAuth();

    const handleNavigation = (href: string) => {
        if (pathname !== href) {
            setIsNavigating(true);
        }
    };

    return (
        <SidebarMenu>
          {navItems
            .filter(item => !item.adminOnly || role === 'admin')
            .map((item: NavItem) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.title, className:"font-body" }}
                  className="font-body"
                  asChild
                >
              <Link href={item.href} onClick={() => handleNavigation(item.href)}>
                    <item.icon />
                    {open && (
                       <span className="whitespace-nowrap overflow-hidden">
                            {item.title}
                        </span>
                    )}
                  </Link>
                </SidebarMenuButton>

            </SidebarMenuItem>
          ))}
        </SidebarMenu>
    );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useProtectedRoute();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
      setIsClient(true);
  }, []);

  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [pathname, isNavigating]);

  if (!isClient || loading || !user) {
    return <LoadingScreen />;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
          <Sidebar>
            <SidebarHeader className="p-4">
              <Link href="/" className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
                <AppLogo className="h-8 w-8 text-primary shrink-0" />
                <span className="text-2xl font-headline font-bold text-primary group-data-[state=collapsed]:hidden">{AppName}</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <ScrollArea className="h-full">
                <AppNav setIsNavigating={setIsNavigating} />
              </ScrollArea>
            </SidebarContent>
            <SidebarFooter className="p-2">
                <UserNav />
            </SidebarFooter>
          </Sidebar>
          <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="relative flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              <AnimatePresence>
                {isNavigating && <LoadingScreen />}
              </AnimatePresence>
              {children}
            </main>
          </div>
      </div>
    </SidebarProvider>
  );
}
