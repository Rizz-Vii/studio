
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
    } from '@/components/ui/sidebar';
    import { Button } from '@/components/ui/button';
    import { navItems, AppLogo, AppName } from '@/config/nav';
    import type { NavItem } from '@/config/nav';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Separator } from '../ui/separator';
    import { useAuth } from '@/context/AuthContext'; // Import useAuth
    import { auth } from '@/lib/firebase'; // Import auth

const AppHeader = () => {
    const { user } = useAuth(); // Use useAuth to check if user is logged in
      const router = useRouter(); // Use useRouter for redirection

      const handleLogout = async () => {
        try {
          await auth.signOut();
          // Redirect to login page after logout
          router.push('/login');
        } catch (error: any) {
          console.error("Error logging out:", error.message);
          // Display an error message
        }
      };
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <AppLogo className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-headline font-semibold">{AppName}</h1>
      </div>
      {/* Add logout button here if user is logged in */}
          {user && ( // Conditionally render logout button if user is logged in
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
      {/* Add other header elements like user profile button here if needed */}
    </header>
  );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          <ScrollArea className="h-[calc(100vh-8rem)]"> {/* Adjust height based on header/footer */}
            <SidebarMenu>
              {navItems.map((item: NavItem) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.title, className:"font-body" }}
                      className="font-body"
                      asChild={typeof SidebarMenuButton !== 'string'} // Ensure NextLink passes href correctly if SidebarMenuButton is a custom component not rendering <a>
                    >
                  <Link href={item.href} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                 
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 flex flex-col items-center">
           <Separator className="my-2 group-data-[state=collapsed]:w-8" />
           <p className="text-xs text-muted-foreground font-body group-data-[state=collapsed]:hidden">&copy; {new Date().getFullYear()} {AppName}</p>
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
