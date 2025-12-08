import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected-route";
import { LoadingScreen } from "@/components/loading-screen";

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const UsersPage = lazy(() => import("@/pages/users"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));
const AdminRole = lazy(() => import("@/pages/adminRole"));
const AppShell = lazy(() =>
  import("@/components/layout/app-shell").then((module) => ({
    default: module.AppShell,
  }))
);

export const protectedRoutes: RouteObject = {
  path: "/",
  element: (
    <ProtectedRoute>
      <Suspense fallback={<LoadingScreen />}>
        <AppShell />
      </Suspense>
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
    {
      path: "admin-role",
      element: <AdminRole />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
};
