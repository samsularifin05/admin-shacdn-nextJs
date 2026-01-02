import "@/styles/globals.css";
import "@/stores/theme-store";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { ModalProvider } from "@/components/providers/modal-provider";

// Error pages that should be handled specially
const errorPages = ["/404", "/_error"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);

    const handleUnauthorized = () => {
      useAuthStore.getState().logout();
      router.replace("/auth/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router]);

  const isAdminRoute = router.pathname.startsWith("/admin");
  const isErrorPage = errorPages.includes(router.pathname);
  const isPublicRoute = !isAdminRoute && !isErrorPage;

  // While mounting, show nothing to prevent hydration flashing
  if (!mounted) {
    return null;
  }

  // Force landing page and other public routes to render without any shell
  if (isPublicRoute) {
    return (
      <>
        <ModalProvider />
        <Component {...pageProps} />
      </>
    );
  }

  // For error pages (like 404):
  // If user is logged in, show it inside the dashboard structure
  // If user is guest, show it clean without sidebar/header
  if (isErrorPage) {
    if (isAuthenticated) {
      return (
        <>
          <ModalProvider />
          <AppShell>
            <Component {...pageProps} />
          </AppShell>
        </>
      );
    }
    return (
      <>
        <ModalProvider />
        <Component {...pageProps} />
      </>
    );
  }

  // For administrative or any other protected pages
  return (
    <>
      <ModalProvider />
      <ProtectedRoute>
        <AppShell>
          <Component {...pageProps} />
        </AppShell>
      </ProtectedRoute>
    </>
  );
}
