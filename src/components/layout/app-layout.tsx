
'use client';
import React from 'react';
    import Link from 'next/link';
    import { usePathname } from 'next/navigation';
    import { useRouter } from 'next/navigation'; // Import useRouter
    import {
      SidebarProvider,
      Sidebar,
      SidebarHeader,
      SidebarContent,
      SidebarMenu,
      SidebarMenuItem,
      SidebarMenuButton,
      SidebarFooter,
      SidebarInset,
      SidebarTrigger,
      useSidebar,
    } from '@/components/ui/sidebar';
    import { Button } from '@/components/ui/button';
    import { navItems, AppLogo, AppName } from '@/config/nav';
    import type { NavItem } from '@/config/nav';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Separator } from '@/components/ui/separator';
    import { useAuth } from '@/context/AuthContext'; // Import useAuth
    import { auth } from '@/lib/firebase'; // Import auth
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { User, LogOut } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { cn } from '@/lib/utils';


const AppHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
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


  if (!user) {
    return null; // Or a login button if preferred
  }

  const userInitial = (profile?.displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg p-2 text-left text-sm group-data-[state=collapsed]:h-12 group-data-[state=collapsed]:w-12 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-0"
        >
          <Avatar className="h-8 w-8">
            {/* If user has a photoURL, you can use it here */}
            {/* <AvatarImage src={user.photoURL} alt={profile?.displayName || user.email} /> */}
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="group-data-[state=collapsed]:hidden">
            <p className="max-w-[7rem] truncate font-medium">
              {profile?.displayName || user.email}
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

const AppNav = () => {
    const pathname = usePathname();
    const { state } = useSidebar();
    const { role } = useAuth();

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
              <Link href={item.href}>
                    <item.icon />
                    <AnimatePresence>
                    {state === 'expanded' && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="whitespace-nowrap overflow-hidden"
                        >
                            {item.title}
                        </motion.span>
                    )}
                    </AnimatePresence>
                  </Link>
                </SidebarMenuButton>

            </SidebarMenuItem>
          ))}
        </SidebarMenu>
    );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
            <AppLogo className="h-8 w-8 text-primary shrink-0" />
            <span className="text-2xl font-headline font-bold text-primary group-data-[state=collapsed]:hidden">{AppName}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <AppNav />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
