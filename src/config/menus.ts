import {
  LayoutDashboard,
  LucideIcon,
  Package,
  ShoppingBag,
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
    title: "Master Data",
    items: [
      
      
      
      
      
      
      
      
      
      
      
      ],
  },
  {
    title: "Transactions",
    items: [
      
      ],
  },
];
