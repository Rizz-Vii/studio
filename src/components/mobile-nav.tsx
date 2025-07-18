"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { navItems } from "@/constants/nav";
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
      duration: 0.2,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.2,
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMenu}
            />

            {/* Drawer */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="fixed left-0 top-0 h-full w-80 bg-sidebar text-sidebar-foreground z-50 md:hidden shadow-2xl"
              data-testid="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2"
                    onClick={closeMenu}
                  >
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">R</span>
                    </div>
                    <span className="text-xl font-headline font-bold text-sidebar-foreground">
                      RankPilot
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeMenu}
                    className="h-12 w-12 min-h-[48px] min-w-[48px] text-sidebar-foreground hover:bg-sidebar-accent"
                    aria-label="Close mobile menu"
                    data-testid="close"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-6 py-4">
                  <div className="space-y-2">
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
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 min-h-[44px]",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            pathname === item.href
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          <span className="font-medium text-base">{item.title}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* User Actions */}
                <div className="p-6 border-t border-sidebar-border space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
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

                  {/* User Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start h-11"
                      onClick={closeMenu}
                    >
                      <Link href="/profile" className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        Profile Settings
                      </Link>
                    </Button>
                    
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start h-11 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={closeMenu}
                    >
                      <Link href="/logout" className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded bg-red-100 flex items-center justify-center">
                          <span className="text-xs">↪</span>
                        </div>
                        Sign Out
                      </Link>
                    </Button>
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
