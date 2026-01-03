import { LayoutDashboard, ShoppingBag, Package } from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: any;
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
      {
        title: "Baki",
        href: "/admin/baki",
        icon: Package,
      },
      {
        title: "Bank",
        href: "/admin/banks",
        icon: Package,
      },
      {
        title: "Barang",
        href: "/admin/barang",
        icon: Package,
      },
      {
        title: "Jenis",
        href: "/admin/jenis",
        icon: Package,
      },
      {
        title: "Kategori",
        href: "/admin/kategori",
        icon: Package,
      },
    ],
  },
  {
    title: "Transactions",
    items: [
      {
        title: "Sales Transaction",
        href: "/admin/sales-transaction",
        icon: ShoppingBag,
      },
    ],
  },
];
