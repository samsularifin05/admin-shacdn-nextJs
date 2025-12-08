import { Link, useLocation } from "react-router-dom";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import { navigation, NavItem } from "@/router/menus";

// Context to manage accordion behavior
interface MenuContextType {
  openMenus: string[];
  toggleMenu: (id: string, parentId?: string) => void;
}

const MenuContext = createContext<MenuContextType>({
  openMenus: [],
  toggleMenu: () => {},
});

// Recursive MenuItem Component
interface MenuItemProps {
  item: NavItem;
  level?: number;
  isCollapsed: boolean;
  parentId?: string;
  itemId: string;
}

function MenuItem({
  item,
  level = 0,
  isCollapsed,
  parentId,
  itemId,
}: MenuItemProps) {
  const location = useLocation();
  const { openMenus, toggleMenu } = useContext(MenuContext);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? location.pathname === item.href : false;
  const isExpanded = openMenus.includes(itemId);

  // Check if any child is active
  const hasActiveChild = (items: NavItem[] | undefined): boolean => {
    if (!items) return false;
    return items.some(
      (child) =>
        child.href === location.pathname || hasActiveChild(child.children)
    );
  };

  const isChildActive = hasActiveChild(item.children);

  // Auto-expand if child is active
  useEffect(() => {
    if (isChildActive && !isExpanded) {
      toggleMenu(itemId, parentId);
    }
  }, [isChildActive, itemId, parentId]);

  const handleClick = () => {
    if (hasChildren) {
      toggleMenu(itemId, parentId);
    }
  };

  const paddingLeft = level * 12 + 8; // 12px per level + 8px base

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            "flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors cursor-pointer",
            isChildActive
              ? "text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isCollapsed ? "justify-center px-2" : "px-2"
          )}
          style={!isCollapsed ? { paddingLeft: `${paddingLeft}px` } : undefined}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {item.badge}
                </span>
              )}
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
            </>
          )}
        </button>

        {/* Submenu with animation */}
        {!isCollapsed && (
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              isExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="mt-1 space-y-1">
                {item.children?.map((child, index) => (
                  <MenuItem
                    key={child.href || `${child.title}-${index}`}
                    item={child}
                    level={level + 1}
                    isCollapsed={isCollapsed}
                    parentId={itemId}
                    itemId={`${itemId}-${index}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Leaf item (no children)
  return (
    <Link
      to={item.href || "#"}
      className={cn(
        "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors cursor-pointer",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed ? "justify-center px-2" : "px-2"
      )}
      style={!isCollapsed ? { paddingLeft: `${paddingLeft}px` } : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebarStore();
  const { user } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Pages"]);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  // Accordion behavior: close siblings when opening a menu
  const toggleMenu = (id: string, parentId?: string) => {
    setOpenMenus((prev) => {
      const isOpen = prev.includes(id);

      if (isOpen) {
        // Close this menu and all its children
        return prev.filter((menuId) => !menuId.startsWith(id));
      } else {
        // Close all sibling menus (same parent)
        const siblings = prev.filter((menuId) => {
          if (!parentId) {
            // Top level - close other top level menus
            return menuId.includes("-");
          } else {
            // Has parent - keep parent and its ancestors, close siblings
            return (
              !menuId.startsWith(parentId + "-") ||
              menuId === id ||
              prev.some((p) => menuId.startsWith(p + "-"))
            );
          }
        });

        // Add parent chain if exists
        const parentChain: string[] = [];
        if (parentId) {
          let current = parentId;
          while (current) {
            parentChain.push(current);
            const lastDash = current.lastIndexOf("-");
            current = lastDash > 0 ? current.substring(0, lastDash) : "";
          }
        }

        return [...new Set([...siblings, ...parentChain, id])];
      }
    });
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        closeMobile();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen, closeMobile]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r bg-background transition-all duration-300",
          // Desktop - always visible
          "hidden lg:block",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          // Mobile - show only when open
          isMobileOpen && "block w-64 lg:hidden"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">SA</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Shadcn Admin</span>
                  <span className="text-xs text-muted-foreground">
                    Vite + ShadcnUI
                  </span>
                </div>
              )}
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={closeMobile}
              className="lg:hidden rounded-md p-2 hover:bg-accent cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <MenuContext.Provider value={{ openMenus, toggleMenu }}>
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {navigation.map((section, sectionIndex) => (
                  <div key={section.title}>
                    {!isCollapsed && (
                      <div className="mb-2 flex items-center justify-between px-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {section.title}
                        </span>
                        {section.collapsible && (
                          <button
                            onClick={() => toggleSection(section.title)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {expandedSections.includes(section.title) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    {(!section.collapsible ||
                      expandedSections.includes(section.title)) && (
                      <div className="space-y-1">
                        {section.items.map((item, index) => (
                          <MenuItem
                            key={item.href || `${item.title}-${index}`}
                            item={item}
                            isCollapsed={isCollapsed}
                            itemId={`section-${sectionIndex}-${index}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </MenuContext.Provider>

          {/* User Profile */}
          {user && (
            <div className="border-t p-4">
              <div
                className={cn(
                  "flex items-center gap-3",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {user.name.charAt(0)}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
