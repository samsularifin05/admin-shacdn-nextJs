import {
  LayoutDashboard,
  ListTodo,
  Package,
  MessageSquare,
  Users,
  FileText,
  Lock,
  AlertCircle,
  Settings,
  HelpCircle,
  FolderTree,
  Shield,
  Key,
  UserCog,
} from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[]; // Support for nested items
}

export interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

export const navigation: NavSection[] = [
  {
    title: "General",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Tasks", href: "/tasks", icon: ListTodo },
      { title: "Apps", href: "/apps", icon: Package },
      { title: "Chats", href: "/chats", icon: MessageSquare, badge: 3 },
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
    title: "Pages",
    collapsible: false,
    items: [
      {
        title: "Auth",
        icon: Lock,
        children: [
          { title: "Sign In", href: "/login", icon: FileText },
          { title: "Sign Up", href: "/signup", icon: FileText },
          {
            title: "Forgot Password",
            href: "/forgot-password",
            icon: FileText,
          },
          {
            title: "Two Factor",
            icon: Shield,
            children: [
              { title: "Setup 2FA", href: "/auth/2fa/setup", icon: Shield },
              { title: "Verify 2FA", href: "/auth/2fa/verify", icon: Shield },
            ],
          },
        ],
      },
      {
        title: "User Management",
        icon: FolderTree,
        children: [
          { title: "List", href: "/user-management", icon: Users },
          { title: "Create", href: "/user-management/create", icon: Users },
          { title: "Edit", href: "/user-management/edit", icon: Users },
        ],
      },
    ],
  },
  {
    title: "Other",
    items: [
      {
        title: "Settings",
        icon: Settings,
        children: [
          { title: "General", href: "/settings", icon: Settings },
          {
            title: "Security",
            icon: Lock,
            children: [
              {
                title: "Password",
                href: "/settings/security/password",
                icon: Key,
              },
              {
                title: "Two Factor",
                href: "/settings/security/2fa",
                icon: Shield,
              },
              {
                title: "Sessions",
                href: "/settings/security/sessions",
                icon: Lock,
              },
            ],
          },
          {
            title: "Notifications",
            href: "/settings/notifications",
            icon: AlertCircle,
          },
        ],
      },
      { title: "Help Center", href: "/help", icon: HelpCircle },
      { title: "Errors", href: "/errors", icon: AlertCircle },
    ],
  },
];
