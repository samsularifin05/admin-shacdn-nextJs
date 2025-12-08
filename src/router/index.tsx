import { createBrowserRouter, Outlet, RouteObject } from "react-router-dom";
import { LoadingScreen } from "@/components/loading-screen";
import { RootErrorBoundary } from "@/components/error-boundary";
import { publicRoutes } from "./public-routes";
import { protectedRoutes } from "./protected-routes";

const router = createBrowserRouter([
  {
    id: "root",
    Component: Outlet,
    hydrateFallbackElement: <LoadingScreen />,
    ErrorBoundary: RootErrorBoundary,
    children: [publicRoutes, protectedRoutes] as RouteObject[],
  },
]);

export default router;
