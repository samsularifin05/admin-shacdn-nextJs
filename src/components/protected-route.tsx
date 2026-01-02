import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingScreen } from "@/components/loading-screen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isHydrated } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for hydration to finish before checking auth
    if (!isHydrated) return;

    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace({
          pathname: "/auth/login",
          query: { from: router.asPath },
        });
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isLoading, isAuthenticated, router, isHydrated]);

  if (!isHydrated || isLoading || !isAuthorized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
