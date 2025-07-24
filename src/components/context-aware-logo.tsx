// src/components/context-aware-logo.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AppLogo, AppName } from "@/constants/enhanced-nav";
import { cn } from "@/lib/utils";

interface ContextAwareLogoProps {
  className?: string;
  showText?: boolean;
}

export function ContextAwareLogo({
  className,
  showText = true,
}: ContextAwareLogoProps) {
  const { user, loading } = useAuth();

  // Determine href based on auth state
  const href = !loading && user ? "/dashboard" : "/";
  const ariaLabel = !loading && user ? "Go to Dashboard" : "Go to Homepage";

  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2", className)}
      aria-label={ariaLabel}
    >
      <AppLogo className="h-8 w-8 text-primary shrink-0" />
      {showText && (
        <span className="text-xl font-headline font-bold text-primary">
          {AppName}
        </span>
      )}
    </Link>
  );
}
