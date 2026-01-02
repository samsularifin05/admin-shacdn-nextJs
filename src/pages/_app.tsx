import "@/styles/globals.css";
import "@/stores/theme-store";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";

// Public routes that don't need AppShell (sidebar/header)
const publicRoutes = [
  "/auth/login",
  "/login",
  "/signup",
  "/forgot-password",
  "/",
];

// Error pages that should be accessible without authentication
const errorPages = ["/404", "/_error"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicRoute = publicRoutes.includes(router.pathname);
  const isErrorPage = errorPages.includes(router.pathname);

  // While mounting, show nothing to prevent hydration flashing
  if (!mounted) {
    return null;
  }

  // Force landing page and other public routes to render without any shell
  if (isPublicRoute) {
    return <Component {...pageProps} />;
  }

  // For error pages (like 404):
  // If user is logged in, show it inside the dashboard structure
  // If user is guest, show it clean without sidebar/header
  if (isErrorPage) {
    if (isAuthenticated) {
      return (
        <AppShell>
          <Component {...pageProps} />
        </AppShell>
      );
    }
    return <Component {...pageProps} />;
  }

  // For administrative or any other protected pages
  return (
    <ProtectedRoute>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    </ProtectedRoute>
  );
}
