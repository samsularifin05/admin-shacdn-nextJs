import { RouteObject, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/login";

export const publicRoutes: RouteObject = {
  path: "/",
  children: [
    {
      index: true,
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "login",
      element: <LoginPage />,
    },
  ],
};
