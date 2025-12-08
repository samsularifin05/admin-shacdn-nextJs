import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen w-full overflow-hidden bg-background">
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
        <div className="flex-1 flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-1 p-6 overflow-auto mt-15">{children}</main>
        </div>
      </div>
    </div>
  );
}
