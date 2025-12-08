import { useEffect } from "react";
import { useRouter } from "next/router";
import { LoadingScreen } from "@/components/loading-screen";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return <LoadingScreen />;
}
