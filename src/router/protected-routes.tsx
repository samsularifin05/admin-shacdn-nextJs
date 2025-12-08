import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import SettingsPage from "@/pages/settings";

export const protectedRoutes: RouteObject = {
  path: "/",
  element: (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  ),
  children: [
    {
      path: "dashboard",
      element: <DashboardPage />,
    },
    {
      path: "users",
      element: <UsersPage />,
    },
    {
      path: "settings",
      element: <SettingsPage />,
    },
  ],
};
