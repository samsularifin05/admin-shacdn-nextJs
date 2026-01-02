import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import { Button } from "./button";

export interface ButtonConfig<TData> {
  label?: string;
  icon?: React.ReactNode;
  onClick?: (row?: TData, index?: number) => void;
  show?: boolean;
  isAdd?: boolean;
  isSeparator?: boolean;
  group?: "action" | "toolbar";
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean | ((row?: TData) => boolean);
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  actions?: ButtonConfig<TData>[];
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  actions = [],
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex items-center gap-2">
        {actions
          .filter(
            (action) =>
              action.show !== false &&
              (action.isAdd || action.group === "toolbar")
          )
          .map((action, index) => {
            const isDisabled =
              typeof action.disabled === "function"
                ? action.disabled({} as TData)
                : action.disabled;

            return (
              <Button
                key={index}
                variant={action.variant || "default"}
                size={action.size || "default"}
                onClick={() => action.onClick?.({} as TData)}
                className={action.className}
                disabled={isDisabled}
              >
                {action.icon}
                {action.label}
              </Button>
            );
          })}
      </div>
    </div>
  );
}
