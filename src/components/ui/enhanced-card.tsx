"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Enhanced Card with motion animations and accessibility
const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    as?: React.ElementType;
    variant?: "default" | "interactive" | "elevated";
    hover?: boolean;
    whileHover?: boolean;
  }
>(
  (
    {
      className,
      as: Component = "div",
      variant = "default",
      hover = true,
      whileHover = true,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      variant === "elevated" && "shadow-lg",
      variant === "interactive" && "shadow-md hover:shadow-lg cursor-pointer",
      hover && "transition-all duration-300",
      className
    );

    // Separate motion props from HTML props
    const {
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationStart,
      onAnimationEnd,
      ...htmlProps
    } = props;

    const motionProps = whileHover
      ? {
          whileHover: {
            scale: variant === "interactive" ? 1.02 : 1.01,
            y: -2,
            boxShadow: "0 20px 32px -8px rgba(0,0,0,0.15)",
          },
          whileTap: variant === "interactive" ? { scale: 0.98 } : undefined,
          transition: { duration: 0.2 },
        }
      : {};

    if (Component === "div") {
      return (
        <motion.div
          ref={ref}
          className={baseStyles}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          {...motionProps}
          {...htmlProps}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <Component ref={ref} className={baseStyles} {...htmlProps}>
        {children}
      </Component>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    animate?: boolean;
  }
>(({ className, animate = true, children, ...props }, ref) => {
  const content = (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="contents"
      >
        {content}
      </motion.div>
    );
  }

  return content;
});
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: React.ElementType;
    animate?: boolean;
  }
>(
  (
    { className, as: Component = "h3", animate = true, children, ...props },
    ref
  ) => {
    const content = (
      <Component
        ref={ref}
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="contents"
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    animate?: boolean;
  }
>(({ className, animate = true, children, ...props }, ref) => {
  const content = (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="contents"
      >
        {content}
      </motion.div>
    );
  }

  return content;
});
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    animate?: boolean;
  }
>(({ className, animate = true, children, ...props }, ref) => {
  const content = (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="contents"
      >
        {content}
      </motion.div>
    );
  }

  return content;
});
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    animate?: boolean;
  }
>(({ className, animate = true, children, ...props }, ref) => {
  const content = (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="contents"
      >
        {content}
      </motion.div>
    );
  }

  return content;
});
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
};
