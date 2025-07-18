"use client";

import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { navItems, AppLogo, AppName } from "@/constants/nav";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const drawerVariants = {
  closed: {
    x: "-100%",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: "0%",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
};

const overlayVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const menuItemVariants = {
  closed: {
    x: -20,
    opacity: 0,
  },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: 0.1 + i * 0.05,
    },
  }),
};

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, role } = useAuth();

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || (user && role === "admin")
  );

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-11 w-11 min-h-[44px] min-w-[44px] opacity-0"
        aria-label="Loading menu"
        disabled
      >
        <Menu className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <>
      {/* Hamburger Button - Only show on mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden h-12 w-12 min-h-[48px] min-w-[48px]"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        data-testid="mobile-menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 h-screen w-screen bg-black/90 backdrop-blur-md z-[60] md:hidden"
              style={{ height: '100dvh' }}
              onClick={closeMenu}
            />

            {/* Drawer */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="fixed left-0 top-0 h-screen w-80 max-w-[60vw] bg-sidebar text-sidebar-foreground z-[70] md:hidden shadow-2xl border-r border-sidebar-border"
              style={{ height: '100dvh' }}
              data-testid="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <div className="flex flex-col h-full bg-sidebar" style={{ height: '100dvh' }}>
                {/* Header */}
                <div className="flex items-center justify-center p-4 border-b border-sidebar-border bg-sidebar shrink-0 min-h-[80px]">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={closeMenu}
                  >
                    <AppLogo className="h-8 w-8 text-primary shrink-0" />
                    <span className="text-2xl font-headline font-bold text-primary">
                      {AppName}
                    </span>
                  </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-2 py-4 bg-sidebar overflow-y-auto overflow-x-hidden">
                  <div className="flex flex-col gap-1 min-h-0">
                    {visibleNavItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                        custom={index}
                      >
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className={cn(
                            "flex items-center gap-2 px-3 py-3 rounded-md min-h-[44px]",
                            "transition-colors duration-200",
                            "hover:bg-accent hover:text-accent-foreground",
                            pathname === item.href
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className="whitespace-nowrap">{item.title}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* User Actions */}
                <div className="p-4 border-t border-sidebar-border bg-sidebar shrink-0">
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/50">
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground font-medium text-sm">
                          {user?.email?.[0].toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-sidebar-foreground/70">
                          {role === "admin" ? "Administrator" : "User"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start h-10 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={closeMenu}
                      >
                        <Link href="/settings" className="flex items-center gap-3">
                          <User className="h-4 w-4 shrink-0" />
                          <span>Settings</span>
                        </Link>
                      </Button>
                      
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={closeMenu}
                      >
                        <Link href="/logout" className="flex items-center gap-3">
                          <LogOut className="h-4 w-4 shrink-0" />
                          <span>Sign Out</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
