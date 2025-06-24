// src/app/(app)/layout.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { User, LogOut, Search, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/ui/loading-screen';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import GlobalSearch from '@/components/global-search';
import AppNavigationContext from '@/context/AppNavigationContext';

const AppHeader = ({ handleNavigation }: { handleNavigation: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void; }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-card/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex h-full w-full items-center justify-between">
        {/* Left side: Mobile trigger and a search bar */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <GlobalSearch />
          </motion.div>
        </div>
        {/* Right side: User navigation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4"
        >
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/seo-audit" onClick={(e) => handleNavigation(e, '/seo-audit')}>
                    <Rocket className="mr-2 h-4 w-4" />
                    New Audit
                </Link>
            </Button>
          <UserNav />
        </motion.div>
      </div>
    </header>
  );
};

const UserNav = () => {
    const { user, profile } = useAuth();
    const router = useRouter();
    const { open, setOpen, isMobile, setUserMenuOpen, pinned } = useSidebar();
    const [openedByMe, setOpenedByMe] = React.useState(false);
  
    const handleLogout = () => {
        router.push('/logout');
    };
  
    const handleOpenChange = (isOpen: boolean) => {
      setUserMenuOpen(isOpen);
      if (isMobile || pinned) {
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
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
            <Avatar className="h-9 w-9 border-2 border-primary/50">
                <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" sideOffset={12}>
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
    handleNavigation: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

const AppNav: React.FC<AppNavProps> = ({ handleNavigation }) => {
    const pathname = usePathname();
    const { open, isMobile } = useSidebar();
    const { user, role } = useAuth();
    
    // On mobile, the sidebar is a sheet, so when it's visible, the text should be too.
    // On desktop, the `open` state controls text visibility.
    const showText = open || isMobile;

    return (
        <SidebarMenu>
          {navItems
            .filter(item => !item.adminOnly || (user && role === 'admin'))
            .map((item: NavItem) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.title, className:"font-body" }}
                  className="font-body"
                  asChild
                >
              <Link href={item.href} onClick={(e) => handleNavigation(e, item.href)}>
                    <item.icon />
                    {showText && (
                       <span className="whitespace-nowrap">
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
  const { user, loading } = useProtectedRoute();
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    if (pathname !== href) {
        setIsNavigating(true);
        router.push(href);
    }
  };

  useEffect(() => {
    // This effect runs when the page navigation completes and the path changes.
    setIsNavigating(false);
  }, [pathname]); // Only depend on the pathname

  if (loading || !user) {
    return <LoadingScreen />;
  }
  
  return (
    <AppNavigationContext.Provider value={{ handleNavigation }}>
        <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-background">
            <Sidebar>
                <SidebarHeader className="p-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
                    <AppLogo className="h-8 w-8 text-primary shrink-0" />
                    <span className="text-2xl font-headline font-bold text-primary group-data-[state=collapsed]:hidden">{AppName}</span>
                </Link>
                </SidebarHeader>
                <SidebarContent>
                <ScrollArea className="h-full">
                    <AppNav handleNavigation={handleNavigation} />
                </ScrollArea>
                </SidebarContent>
                <SidebarFooter className="p-2">
                    <SidebarTrigger className="hidden md:flex" />
                </SidebarFooter>
            </Sidebar>
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <AppHeader handleNavigation={handleNavigation} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <AnimatePresence>
                    {isNavigating && <LoadingScreen />}
                    </AnimatePresence>
                    {!isNavigating && children}
                </main>
            </div>
        </div>
        </SidebarProvider>
    </AppNavigationContext.Provider>
  );
}
