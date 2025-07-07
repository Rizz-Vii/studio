// src/components/site-header.tsx
"use client";

import Link from "next/link";
import { AppLogo, AppName } from "@/constants/nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline text-primary">
            {AppName}
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex gap-6">
            <a
              href="/#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </a>
            <a
              href="/#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Pricing
            </a>
            <a
              href="/#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              FAQ
            </a>
          </nav>
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
