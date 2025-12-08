import { RouteObject, Navigate } from "react-router-dom";
import { PublicRoute } from "@/components/public-route";
import LoginPage from "@/pages/auth/login";
import NotFoundPage from "@/pages/not-found";

export const publicRoutes: RouteObject = {
  path: "/",
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
