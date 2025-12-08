import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
}
