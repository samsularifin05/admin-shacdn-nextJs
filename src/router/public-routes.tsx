import { lazy, Suspense } from "react";
import { RouteObject, Navigate, Outlet } from "react-router-dom";
import { PublicRoute } from "@/components/public-route";
import { LoadingScreen } from "@/components/loading-screen";

const LoginPage = lazy(() => import("@/pages/auth/login"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

export const publicRoutes: RouteObject = {
  path: "/",
  element: (
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "login",
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      ),
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
};
