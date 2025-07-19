"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";
import { navItems } from "@/constants/nav";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import Link from "next/link";

const menuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 20,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

const textSpanVariants = {
  open: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
  closed: { opacity: 0, x: -10, transition: { duration: 0.15 } }
};

export default function AppNav() {
  const pathname = usePathname();
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { user, role } = useAuth();
  const { subscription, canUseFeature } = useSubscription();

  const showText = open || isMobile;
  const handleMobileNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Filter nav items based on user role and subscription
  const visibleNavItems = navItems.filter((item) => {
    // First check admin permissions
    if (item.adminOnly && (!user || role !== "admin")) {
      return false;
    }

    // Then check subscription requirements
    if (item.requiredTier) {
      return subscription?.tier === item.requiredTier || 
             (item.requiredTier === "starter" && subscription?.tier === "agency") ||
             subscription?.tier === "agency";
    }

    // Check specific feature requirements
    if (item.feature && !canUseFeature(item.feature)) {
      return false;
    }

    return true;
  });

  return (
    <nav className="px-2">
      <motion.ul
        initial="closed"
        animate="open"
        className="flex flex-col gap-1"
      >
        {visibleNavItems.map((item) => (
          <motion.li
            key={item.href}
            variants={menuItemVariants}
            className="relative"
          >
            <Link
              href={item.href}
              onClick={handleMobileNavClick}
              className={`
                flex items-center gap-2 px-3 py-3 rounded-md min-h-[44px]
                transition-colors duration-200
                hover:bg-accent hover:text-accent-foreground
                ${pathname === item.href ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}
              `}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence mode="wait">
                {showText && (
                  <motion.span
                    variants={textSpanVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </nav>
  );
}
