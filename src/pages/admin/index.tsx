import { useEffect } from "react";
import { useRouter } from "next/router";
import { LoadingScreen } from "@/components/loading-screen";

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return <LoadingScreen />;
}
