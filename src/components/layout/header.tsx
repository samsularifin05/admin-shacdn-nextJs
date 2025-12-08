import { Link, useLocation } from "react-router-dom";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils";
import { Search, Moon, Sun, Settings, Menu, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navTabs = [
  { name: "Overview", href: "/dashboard" },
  { name: "Customers", href: "/customers" },
  { name: "Products", href: "/products" },
  { name: "Settings", href: "/settings" },
];

export function Header() {
  const location = useLocation();
  const { toggleCollapse, toggleMobile, isCollapsed } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-16 w-full items-center border-b bg-background transition-all duration-300",
        // Desktop
        "lg:left-64",
        isCollapsed && "lg:left-16",
        // Mobile
        "left-0"
      )}
      style={{
        width:
          typeof window !== "undefined" && window.innerWidth >= 1024
            ? isCollapsed
              ? "calc(100% - 4rem)"
              : "calc(100% - 16rem)"
            : "100%",
      }}
    >
      <div className="flex w-full items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobile}
            className="h-9 w-9 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden lg:flex h-9 w-9"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Navigation Tabs - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {navTabs.map((tab) => {
              const isActive = location.pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center Section - Search (Hidden on small screens) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 pr-4 h-9"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Settings - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden sm:flex h-9 w-9"
          >
            <Link to="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
