// src/components/site-header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppLogo, AppName } from "@/constants/nav";
import { Button } from "@/components/ui/button";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useAuth } from "@/context/AuthContext";
import { useHydration } from "@/components/HydrationContext";
import { useIsMobile } from "@/lib/mobile-responsive-utils";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ContextAwareLogo } from "@/components/context-aware-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { href: "/features", label: "Features", external: false },
  { href: "/#pricing", label: "Pricing", external: false },
  { href: "/#faq", label: "FAQ", external: false },
  { href: "/docs", label: "Documentation", external: false },
];

export default function SiteHeader() {
  const { user } = useAuth();
  const hydrated = useHydration();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  // Handle mobile menu body scroll lock
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Skip to main content for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
      >
        Skip to main content
      </a>

      <motion.header
        className={cn(
          "sticky top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50"
            : "bg-background/90 backdrop-blur-sm border-b border-border/20"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 mx-auto">
          {/* Logo */}
          <ContextAwareLogo />

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-6"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!hydrated ? (
              // Loading skeleton
              <div className="flex items-center space-x-2">
                <div className="h-9 w-16 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EnhancedButton
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="User menu"
                  >
                    <User className="h-5 w-5" />
                  </EnhancedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/demo"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Live Demo
                </Link>
                <div className="flex items-center gap-2">
                  <EnhancedButton variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </EnhancedButton>
                  <EnhancedButton asChild>
                    <Link href="/register">Start Free Trial</Link>
                  </EnhancedButton>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <EnhancedButton
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </EnhancedButton>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-16 bottom-0 w-80 max-w-[80vw] bg-background border-l border-border z-50 md:hidden"
            >
              <nav
                className="flex flex-col p-6 space-y-4"
                role="navigation"
                aria-label="Mobile navigation"
              >
                {/* Navigation Links */}
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center p-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors min-h-[48px]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Auth Section */}
                {hydrated && (
                  <div className="pt-6 border-t border-border space-y-3">
                    {user ? (
                      <>
                        <EnhancedButton fullWidth asChild>
                          <Link
                            href="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                        </EnhancedButton>
                        <EnhancedButton fullWidth asChild>
                          <Link
                            href="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Profile
                          </Link>
                        </EnhancedButton>
                        <EnhancedButton
                          fullWidth
                          variant="outline"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          Sign Out
                        </EnhancedButton>
                      </>
                    ) : (
                      <>
                        <EnhancedButton fullWidth variant="outline" asChild>
                          <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Login
                          </Link>
                        </EnhancedButton>
                        <EnhancedButton fullWidth asChild>
                          <Link
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </EnhancedButton>
                      </>
                    )}
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
