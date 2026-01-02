import {
  LayoutDashboard,
  Users,
  Settings,
  ShoppingBag,
  BarChart,
  FileText,
  Mail,
  MessageSquare,
  Calendar,
  Layers,
  HelpCircle,
  Shield,
  ListTodo,
  Package,
  UserCog,
  Key,
  Lock,
} from "lucide-react";

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
      { title: "Tasks", href: "/admin/tasks", icon: ListTodo },
      { title: "Apps", href: "/admin/apps", icon: Package },
      { title: "Chats", href: "/admin/chats", icon: MessageSquare },
      {
        title: "Users",
        icon: Users,
        children: [
          { title: "All Users", href: "/admin/users", icon: Users },
          {
            title: "User Roles",
            icon: Lock,
            children: [
              {
                title: "Admin Roles",
                href: "/admin/users/roles/admin",
                icon: Shield,
              },
              {
                title: "User Roles",
                href: "/admin/users/roles/user",
                icon: UserCog,
              },
              {
                title: "Guest Roles",
                href: "/admin/users/roles/guest",
                icon: Users,
              },
            ],
          },
          {
            title: "Permissions",
            icon: Key,
            children: [
              {
                title: "View Permissions",
                href: "/admin/users/permissions/view",
                icon: Key,
              },
              {
                title: "Edit Permissions",
                href: "/admin/users/permissions/edit",
                icon: Key,
              },
              {
                title: "Delete Permissions",
                href: "/admin/users/permissions/delete",
                icon: Key,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Management",
    collapsible: true,
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Products",
        href: "/admin/products",
        icon: ShoppingBag,
      },
      {
        title: "Orders",
        href: "/admin/orders",
        icon: FileText,
        badge: "3",
      },
    ],
  },
  {
    title: "Apps",
    collapsible: true,
    items: [
      {
        title: "Mail",
        href: "/admin/mail",
        icon: Mail,
      },
      {
        title: "Chat",
        href: "/admin/chat",
        icon: MessageSquare,
      },
      {
        title: "Calendar",
        href: "/admin/calendar",
        icon: Calendar,
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Components",
        href: "/admin/components",
        icon: Layers,
        children: [
          {
            title: "UI Elements",
            href: "/admin/components/ui",
          },
          {
            title: "Forms",
            href: "/admin/components/forms",
          },
        ],
      },
      {
        title: "Help",
        href: "/admin/help",
        icon: HelpCircle,
      },
    ],
  },
];
