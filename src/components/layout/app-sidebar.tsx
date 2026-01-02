import Link from "next/link";
import { useRouter } from "next/router";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import { navigation, NavItem } from "@/config/menus";

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
  const router = useRouter();
  const { openMenus, toggleMenu } = useContext(MenuContext);

  const hasChildren = item.children && item.children.length > 0;
  const isActive =
    item.href && router.isReady
      ? router.pathname === item.href || router.asPath === item.href
      : false;
  const isExpanded = openMenus.includes(itemId);

  // Check if any child is active
  const hasActiveChild = (items: NavItem[] | undefined): boolean => {
    if (!items || !router.isReady) return false;
    return items.some(
      (child) =>
        child.href === router.pathname ||
        child.href === router.asPath ||
        hasActiveChild(child.children)
    );
  };

  const isChildActive = hasActiveChild(item.children);

  // Removed auto-expand logic to allow menus to close on navigation

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (hasChildren) {
      toggleMenu(itemId, parentId);
    }
  };

  const paddingLeft = level * 12 + 8; // 12px per level + 8px base

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors cursor-pointer",
            isChildActive
              ? "text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isCollapsed ? "justify-center px-2" : "px-2"
          )}
          style={{ paddingLeft: !isCollapsed ? `${paddingLeft}px` : undefined }}
          aria-label={`${item.title} menu`}
          aria-expanded={isExpanded}
        >
          {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
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

        {/* Submenu with smooth animation */}
        {!isCollapsed && (
          <div
            className={cn(
              "grid transition-all",
              isExpanded
                ? "grid-rows-[1fr] opacity-100 duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                : "grid-rows-[0fr] opacity-0 duration-300 ease-in"
            )}
            style={{
              willChange: isExpanded ? "auto" : "grid-template-rows, opacity",
            }}
          >
            <div className="overflow-hidden">
              <div
                className={cn(
                  "pt-1 space-y-1 transition-all",
                  isExpanded
                    ? "translate-y-0 opacity-100 duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    : "-translate-y-2 opacity-0 duration-200 ease-out"
                )}
              >
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
      href={item.href || "#"}
      scroll={false}
      prefetch={false}
      className={cn(
        "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors cursor-pointer",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed ? "justify-center px-2" : "px-2"
      )}
      style={{ paddingLeft: !isCollapsed ? `${paddingLeft}px` : undefined }}
    >
      {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
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
  const router = useRouter();
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
        // Opening a menu
        if (!parentId) {
          // Top level menu - close ALL other top level menus
          // Keep only menus that are children of the one we're opening
          return [id];
        } else {
          // Nested menu - close siblings at the same level
          // Build parent chain
          const parentChain: string[] = [];
          let current = parentId;
          while (current) {
            parentChain.push(current);
            const lastDash = current.lastIndexOf("-");
            current = lastDash > 0 ? current.substring(0, lastDash) : "";
          }

          // Keep parent chain and close siblings
          const filtered = prev.filter((menuId) => {
            // Keep if it's in the parent chain
            if (parentChain.includes(menuId)) return true;

            // Check if this is a direct sibling (same parent, same depth)
            // A sibling has the format: parentId-X where X is a number
            // We want to close siblings but not descendants of siblings
            const siblingPattern = new RegExp(
              `^${parentId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+$`
            );
            if (siblingPattern.test(menuId) && menuId !== id) {
              // This is a direct sibling, close it and all its descendants
              return false;
            }

            // Check if this is a descendant of a sibling
            const parts = menuId.split("-");
            const idParts = id.split("-");
            const parentParts = parentId.split("-");

            // If menuId has more parts than id and shares the same parent prefix
            if (parts.length > parentParts.length) {
              const menuParentPrefix = parts
                .slice(0, parentParts.length + 1)
                .join("-");
              const idParentPrefix = idParts
                .slice(0, parentParts.length + 1)
                .join("-");

              // If they have different parents at the same level, close it
              if (
                menuParentPrefix !== idParentPrefix &&
                menuParentPrefix.startsWith(parentId + "-")
              ) {
                return false;
              }
            }

            // Keep other menus
            return true;
          });

          return [...filtered, id];
        }
      }
    });
  };

  // Close mobile sidebar and update menus when route changes
  useEffect(() => {
    if (!router.isReady) return;
    closeMobile();

    // Check if current route is a child of any menu item
    const isChildRoute = (
      items: NavItem[],
      parentIds: string[] = []
    ): string[] => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const currentId =
          parentIds.length > 0
            ? `${parentIds.join("-")}-${i}`
            : `section-${navigation.findIndex((s) =>
                s.items.includes(item)
              )}-${i}`;

        if (item.href === router.pathname || item.href === router.asPath) {
          // Found the current route, return parent chain
          return parentIds;
        }

        if (item.children) {
          const result = isChildRoute(item.children, [...parentIds, currentId]);
          if (result.length > 0) {
            // Found a match in children, return the result which includes currentId
            return result;
          }
          // Also check if any direct child matches (for items without further nesting)
          if (
            item.children.some(
              (c) => c.href === router.pathname || c.href === router.asPath
            )
          ) {
            return [...parentIds, currentId];
          }
        }
      }
      return [];
    };

    // Get parent chain for current route
    const parentChain: string[] = [];
    navigation.forEach((section) => {
      const result = isChildRoute(section.items, []);
      if (result.length > 0) {
        parentChain.push(...result);
      }
    });

    // Only update if the parent chain is different from current openMenus
    // This prevents unnecessary closing/reopening when navigating within the same submenu
    setOpenMenus((prevOpenMenus) => {
      // Check if parent chain is exactly the same (same items, same order)
      const isSameChain =
        parentChain.length === prevOpenMenus.length &&
        parentChain.every((id, index) => prevOpenMenus[index] === id);

      if (isSameChain) {
        // Exact same parent chain, no update needed
        return prevOpenMenus;
      }

      // Check if all parent chain items are already open (might be in different order or with extras)
      const allParentsOpen = parentChain.every((id) =>
        prevOpenMenus.includes(id)
      );

      if (allParentsOpen) {
        // All required parents are already open
        // Check if we have extra menus that should be closed
        const hasExtras = prevOpenMenus.some((id) => !parentChain.includes(id));

        if (!hasExtras) {
          // No extras, keep current state (might just be different order)
          return prevOpenMenus;
        }

        // We have extras, but let's keep them to avoid flickering
        // Only close if they're not in the parent chain
        return prevOpenMenus;
      }

      // Some parents are missing, need to open them
      // Merge with existing open menus to keep everything open
      const merged = Array.from(new Set([...prevOpenMenus, ...parentChain]));
      return merged;
    });
  }, [router.pathname, router.asPath, router.isReady, closeMobile]);

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
          "fixed left-0 top-0 z-50 h-screen border-r bg-background",
          // Desktop - always visible
          "lg:block",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "lg:transition-[width] lg:duration-300 lg:ease-in-out",
          // Mobile - slide in/out
          "w-64 transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop override - always on screen
          "lg:translate-x-0"
        )}
      >
        {/* Sidebar Content */}
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link
              href="/admin/dashboard"
              scroll={false}
              prefetch={false}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">S</span>
              </div>
              <span
                className={cn(
                  "text-lg font-semibold transition-opacity duration-300",
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}
              >
                Shadcn Admin
              </span>
            </Link>
            {/* Mobile Close Button */}
            <button
              onClick={closeMobile}
              className="lg:hidden rounded-md p-2 hover:bg-accent cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <MenuContext.Provider value={{ openMenus, toggleMenu }}>
            <nav
              className="flex-1 overflow-y-auto p-4"
              aria-label="Main navigation"
            >
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
                            type="button"
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
