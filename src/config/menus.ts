import {
  LayoutDashboard,
  LucideIcon,
  Package,
  Settings,
  Wrench,
} from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: LucideIcon;
  label?: string;
  badge?: string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  collapsible?: boolean;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "General",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CMS Builder",
    items: [
      { title: "Module Builder", href: "/admin/cms-builder", icon: Wrench },
      { title: "Page Builder", href: "/admin/page-builder", icon: Package },
    ],
  },
  {
    title: "Master Data",
    items: [
      
      ],
  },
  {
    title: "Transactions",
    items: [],
  },
  {
    title: "Settings",
    items: [
      { title: "General Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];
