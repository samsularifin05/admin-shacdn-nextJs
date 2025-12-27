import "@/globals.css";
import "@/stores/theme-store";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/protected-route";

// Public routes that don't need AppShell (sidebar/header)
const publicRoutes = [
  "/auth/login",
  "/login",
  "/signup",
  "/forgot-password",
  "/",
];

// Error pages that should show AppShell but skip ProtectedRoute
const errorPages = ["/404", "/_error"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicRoute = publicRoutes.includes(router.pathname);
  const isErrorPage = errorPages.includes(router.pathname);

  // For public routes only, render without AppShell
  if (isPublicRoute) {
    return <Component {...pageProps} />;
  }

  // For error pages, render with AppShell but without ProtectedRoute
  if (isErrorPage) {
    return (
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    );
  }

  // For protected routes, wrap with ProtectedRoute and AppShell (persistent)
  return (
    <ProtectedRoute>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    </ProtectedRoute>
  );
}
