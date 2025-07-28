"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React, { forwardRef } from "react";

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[48px] min-w-[48px] touch-manipulation select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 active:scale-95",
        success: "bg-green-600 text-white hover:bg-green-700 active:scale-95",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        mobile: "h-12 px-6 text-base", // Mobile-optimized size
      },
      loading: {
        true: "pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  pulse?: boolean;
  hapticFeedback?: boolean;
  /**
   * Platform-specific haptic feedback configuration
   */
  hapticConfig?: {
    enabled: boolean;
    pattern?: number | number[];
    platform?: 'ios' | 'android' | 'web';
  };
  /**
   * Accessibility enhancements
   */
  a11y?: {
    label?: string;
    description?: string;
    shortcut?: string;
  };
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      pulse = false,
      hapticFeedback = true,
      asChild = false,
      children,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : motion.button;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for mobile devices
      if (hapticFeedback && "vibrate" in navigator) {
        navigator.vibrate(10);
      }

      onClick?.(e);
    };

    const buttonContent = (
      <>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </>
    );

    const motionProps = {
      whileHover: loading ? {} : { scale: 1.02 },
      whileTap: loading ? {} : { scale: 0.98 },
      transition: { type: "spring" as const, stiffness: 400, damping: 10 },
    };

    // Separate HTML props from motion props
    const {
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationStart,
      onAnimationEnd,
      ...htmlProps
    } = props;

    return (
      <Comp
        className={cn(
          enhancedButtonVariants({ variant, size, loading, className }),
          fullWidth && "w-full",
          pulse && "animate-pulse"
        )}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        {...motionProps}
        {...htmlProps}
      >
        {buttonContent}
      </Comp>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, enhancedButtonVariants };
