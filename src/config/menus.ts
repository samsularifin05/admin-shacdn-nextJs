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
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Tasks", href: "/tasks", icon: ListTodo },
      { title: "Apps", href: "/apps", icon: Package },
      { title: "Chats", href: "/chats", icon: MessageSquare },
      {
        title: "Users",
        icon: Users,
        children: [
          { title: "All Users", href: "/users", icon: Users },
          {
            title: "User Roles",
            icon: Lock,
            children: [
              {
                title: "Admin Roles",
                href: "/users/roles/admin",
                icon: Shield,
              },
              { title: "User Roles", href: "/users/roles/user", icon: UserCog },
              { title: "Guest Roles", href: "/users/roles/guest", icon: Users },
            ],
          },
          {
            title: "Permissions",
            icon: Key,
            children: [
              {
                title: "View Permissions",
                href: "/users/permissions/view",
                icon: Key,
              },
              {
                title: "Edit Permissions",
                href: "/users/permissions/edit",
                icon: Key,
              },
              {
                title: "Delete Permissions",
                href: "/users/permissions/delete",
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
        href: "/users",
        icon: Users,
      },
      {
        title: "Products",
        href: "/products",
        icon: ShoppingBag,
      },
      {
        title: "Orders",
        href: "/orders",
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
        href: "/mail",
        icon: Mail,
      },
      {
        title: "Chat",
        href: "/chat",
        icon: MessageSquare,
      },
      {
        title: "Calendar",
        href: "/calendar",
        icon: Calendar,
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Components",
        href: "/components",
        icon: Layers,
        children: [
          {
            title: "UI Elements",
            href: "/components/ui",
          },
          {
            title: "Forms",
            href: "/components/forms",
          },
        ],
      },
      {
        title: "Help",
        href: "/help",
        icon: HelpCircle,
      },
    ],
  },
];
