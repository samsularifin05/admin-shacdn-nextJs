import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { Outlet } from "react-router-dom";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";

export function AppShell() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          // Desktop
          "lg:ml-64",
          isCollapsed && "lg:ml-16",
          // Mobile
          "ml-0"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="container mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
