import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  KeyRound,
  ScanText,
  Users,
  Search,
  ListChecks,
  Link,
  Rocket,
  BookText,
  Shield,
  Lightbulb,
  User,
  Settings,
  Brain,
  Eye,
  Fingerprint,
  Layers,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  Map,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  adminOnly?: boolean;
  requiredTier?: "starter" | "agency" | "enterprise";
  feature?: string;
  badge?: string;
  description?: string;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  id: string;
  description?: string;
  badge?: string;
  items: NavItem[];
  requiredTier?: "starter" | "agency" | "enterprise";
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Enhanced NeuroSEO™ Suite Navigation
export const neuroSEOItems: NavItem[] = [
  {
    title: "NeuroSEO™ Dashboard",
    href: "/neuroseo",
    icon: Brain,
    description: "AI-powered content analysis dashboard",
    badge: "AI",
  },
  {
    title: "NeuralCrawler™",
    href: "/neuroseo/neural-crawler",
    icon: Search,
    description: "Intelligent web content extraction",
    requiredTier: "starter",
  },
  {
    title: "SemanticMap™",
    href: "/neuroseo/semantic-map",
    icon: Map,
    description: "Advanced NLP analysis and topic visualization",
    requiredTier: "starter",
  },
  {
    title: "AI Visibility Engine",
    href: "/neuroseo/ai-visibility",
    icon: Eye,
    description: "LLM citation tracking and optimization",
    requiredTier: "agency",
  },
  {
    title: "TrustBlock™",
    href: "/neuroseo/trust-block",
    icon: Fingerprint,
    description: "E-A-T optimization and content authenticity",
    requiredTier: "starter",
  },
  {
    title: "RewriteGen™",
    href: "/neuroseo/rewrite-gen",
    icon: RefreshCw,
    description: "AI-powered content rewriting and optimization",
    requiredTier: "agency",
  },
];

// SEO Tools Navigation
export const seoToolsItems: NavItem[] = [
  {
    title: "Keyword Tool",
    href: "/keyword-tool",
    icon: KeyRound,
    description: "AI-driven keyword research and analysis",
  },
  {
    title: "Content Analyzer",
    href: "/content-analyzer",
    icon: ScanText,
    description: "Content optimization and readability analysis",
  },
  {
    title: "SEO Audit",
    href: "/seo-audit",
    icon: ListChecks,
    description: "Comprehensive technical SEO analysis",
  },
  {
    title: "Content Brief",
    href: "/content-brief",
    icon: BookText,
    description: "AI-powered content briefs and strategy",
    requiredTier: "starter",
  },
];

// Competitive Intelligence Navigation
export const competitiveItems: NavItem[] = [
  {
    title: "Competitors",
    href: "/competitors",
    icon: Users,
    description: "Competitor analysis and benchmarking",
    requiredTier: "starter",
    feature: "competitor-analysis",
  },
  {
    title: "SERP View",
    href: "/serp-view",
    icon: TrendingUp,
    description: "Search engine results page visualization",
    requiredTier: "starter",
  },
  {
    title: "Link View",
    href: "/link-view",
    icon: Link,
    description: "Backlink analysis and link building opportunities",
    requiredTier: "starter",
  },
];

// Management Navigation
export const managementItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your SEO performance",
  },
  {
    title: "Insights",
    href: "/insights",
    icon: Lightbulb,
    description: "AI-powered actionable insights",
  },
  {
    title: "Performance",
    href: "/performance",
    icon: BarChart3,
    description: "Performance metrics and analytics",
    requiredTier: "starter",
  },
];

// User & Settings Navigation
export const userItems: NavItem[] = [
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "User profile and account settings",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Application settings and preferences",
  },
  {
    title: "Admin",
    href: "/adminonly",
    icon: Shield,
    description: "Administrative controls and user management",
    adminOnly: true,
  },
];

// Enhanced Navigation Groups
export const navGroups: NavGroup[] = [
  {
    title: "NeuroSEO™ Suite",
    icon: Brain,
    id: "neuroseo",
    description: "AI-powered SEO analysis and optimization",
    badge: "AI",
    items: neuroSEOItems,
    defaultExpanded: true,
    collapsible: true,
  },
  {
    title: "SEO Tools",
    icon: Zap,
    id: "seo-tools",
    description: "Essential SEO analysis and optimization tools",
    items: seoToolsItems,
    defaultExpanded: true,
    collapsible: true,
  },
  {
    title: "Competitive Intelligence",
    icon: Target,
    id: "competitive",
    description: "Competitor analysis and market intelligence",
    items: competitiveItems,
    requiredTier: "starter",
    defaultExpanded: false,
    collapsible: true,
  },
  {
    title: "Management",
    icon: LayoutDashboard,
    id: "management",
    description: "Dashboard and performance tracking",
    items: managementItems,
    defaultExpanded: false,
    collapsible: true,
  },
];

// Flat navigation items for backward compatibility and mobile
export const flatNavItems: NavItem[] = [
  ...managementItems.slice(0, 2), // Dashboard, Insights
  ...neuroSEOItems.slice(0, 1), // NeuroSEO Dashboard
  ...seoToolsItems, // All SEO tools
  ...competitiveItems, // Competitive tools
  ...managementItems.slice(2), // Performance
  ...userItems, // Profile, Settings, Admin
];

// Helper functions
export const getVisibleNavGroups = (
  userTier?: string,
  isAdmin?: boolean
): NavGroup[] => {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // Check admin access
        if (item.adminOnly && !isAdmin) return false;
        
        // Check tier access
        if (item.requiredTier) {
          if (!userTier) return false;
          const tierHierarchy = ["starter", "agency", "enterprise"];
          const userTierIndex = tierHierarchy.indexOf(userTier);
          const requiredTierIndex = tierHierarchy.indexOf(item.requiredTier);
          if (userTierIndex < requiredTierIndex) return false;
        }
        
        return true;
      }),
    }))
    .filter((group) => {
      // Filter out groups with no visible items
      if (group.items.length === 0) return false;
      
      // Check group-level tier requirements
      if (group.requiredTier) {
        if (!userTier) return false;
        const tierHierarchy = ["starter", "agency", "enterprise"];
        const userTierIndex = tierHierarchy.indexOf(userTier);
        const requiredTierIndex = tierHierarchy.indexOf(group.requiredTier);
        if (userTierIndex < requiredTierIndex) return false;
      }
      
      return true;
    });
};

export const getVisibleNavItems = (
  userTier?: string,
  isAdmin?: boolean
): NavItem[] => {
  return flatNavItems.filter((item) => {
    // Check admin access
    if (item.adminOnly && !isAdmin) return false;
    
    // Check tier access
    if (item.requiredTier) {
      if (!userTier) return false;
      const tierHierarchy = ["starter", "agency", "enterprise"];
      const userTierIndex = tierHierarchy.indexOf(userTier);
      const requiredTierIndex = tierHierarchy.indexOf(item.requiredTier);
      if (userTierIndex < requiredTierIndex) return false;
    }
    
    return true;
  });
};

export const findNavItemByHref = (href: string): NavItem | undefined => {
  return flatNavItems.find((item) => item.href === href);
};

export const getNavGroupByItemHref = (href: string): NavGroup | undefined => {
  return navGroups.find((group) => 
    group.items.some((item) => item.href === href)
  );
};

// Tier display helpers
export const getTierBadgeProps = (tier: string) => {
  const tierConfig = {
    starter: { color: "blue", icon: Zap, label: "Starter" },
    agency: { color: "purple", icon: Target, label: "Agency" },
    enterprise: { color: "gold", icon: Rocket, label: "Enterprise" },
  };
  
  return tierConfig[tier as keyof typeof tierConfig] || null;
};

// App constants
export const AppLogo = Rocket;
export const AppName = "RankPilot";

// Navigation state management
export interface NavState {
  expandedGroups: Set<string>;
  activeGroup?: string;
  activeItem?: string;
}

export const defaultNavState: NavState = {
  expandedGroups: new Set(["neuroseo", "seo-tools"]),
  activeGroup: undefined,
  activeItem: undefined,
};

// Error boundaries for navigation
export const handleNavError = (error: Error, context: string) => {
  console.error(`Navigation error in ${context}:`, error);
  
  // Report to error tracking service in production
  if (process.env.NODE_ENV === "production") {
    // Analytics or error tracking service call
  }
  
  return {
    fallback: "dashboard",
    message: "Navigation temporarily unavailable",
  };
};

// Navigation analytics
export const trackNavigation = (itemHref: string, groupId?: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "navigation_click", {
      event_category: "navigation",
      event_label: itemHref,
      custom_parameter_1: groupId,
    });
  }
};
