import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingScreen } from "@/components/loading-screen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
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
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthorized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
