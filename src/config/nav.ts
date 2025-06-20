import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, KeyRound, ScanText, Users, Search, ListChecks, Link, TrendingUp, Rocket, User } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
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
    title: 'SEO Competitors',
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
    title: 'Insights',
    href: '/insights',
    icon: TrendingUp,
  },
];

export const AppLogo = Rocket;
export const AppName = "RankPilot";
