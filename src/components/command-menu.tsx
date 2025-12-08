"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { navigation } from "@/router/menus";
import type { NavItem } from "@/router/menus";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Flatten navigation items for search
  const flattenNavItems = (
    items: NavItem[],
    parentTitle = ""
  ): Array<{ title: string; href: string; group: string }> => {
    const result: Array<{ title: string; href: string; group: string }> = [];

    items.forEach((item) => {
      if (item.href) {
        result.push({
          title: item.title,
          href: item.href,
          group: parentTitle || "Navigation",
        });
      }

      if (item.children) {
        result.push(...flattenNavItems(item.children, item.title));
      }
    });

    return result;
  };

  const allNavItems = React.useMemo(() => {
    const items: Array<{ title: string; href: string; group: string }> = [];
    navigation.forEach((section) => {
      items.push(...flattenNavItems(section.items, section.title));
    });
    return items;
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="relative w-full max-w-sm flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search menu..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Group items by section */}
          {navigation.map((section) => {
            const sectionItems = allNavItems.filter(
              (item) =>
                item.group === section.title ||
                section.items.some((navItem) => navItem.title === item.group)
            );

            if (sectionItems.length === 0) return null;

            return (
              <CommandGroup key={section.title} heading={section.title}>
                {sectionItems.map((item) => (
                  <CommandItem
                    key={item.href}
                    onSelect={() => handleSelect(item.href)}
                    className="cursor-pointer"
                  >
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
