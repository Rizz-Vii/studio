import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, KeyRound, ScanText, Users, Search, ListChecks, Link, TrendingUp, Rocket, User, Activity, BookText, Shield, Lightbulb } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Insights',
    href: '/insights',
    icon: Lightbulb,
  },
  {
    title: 'Content Brief',
    href: '/content-brief',
    icon: BookText,
  },
  {
    title: 'Keyword Tool',
    href: '/keyword-tool',
    icon: KeyRound,
  },
  {
    title: 'Content Analyzer',
    href: '/content-analyzer',
    icon: ScanText,
  },
  {
    title: 'Competitors',
    href: '/competitors',
    icon: Users,
  },
  {
    title: 'SERP View',
    href: '/serp-view',
    icon: Search,
  },
  {
    title: 'SEO Audit',
    href: '/seo-audit',
    icon: ListChecks,
  },
  {
    title: 'Link View',
    href: '/link-view',
    icon: Link,
  },
  {
    title: 'Admin',
    href: '/adminonly',
    icon: Shield,
    adminOnly: true,
  },
];

export const AppLogo = Rocket;
export const AppName = "RankPilot";
