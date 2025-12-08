import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingScreen } from "@/components/loading-screen";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <LoadingScreen />; // Show loading while redirecting
  }

  return <>{children}</>;
}
