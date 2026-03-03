import {
  Column,
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  PaginationState,
  OnChangeFn,
  ColumnFiltersState,
  getFilteredRowModel,
  Row,
  VisibilityState,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState, Fragment } from "react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar, type ButtonConfig } from "./data-table-toolbar";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Search
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  manualFiltering?: boolean;
  // Pagination
  pageCount?: number;
  manualPagination?: boolean;
  pagination?: PaginationState; // Added to support external state
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalCount?: number; // Added to support showing total rows in manual pagination
  // Loading
  isLoading?: boolean;
  actions?: ButtonConfig<TData>[];
  // Features
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  // Expansion
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  getRowCanExpand?: (row: Row<TData>) => boolean;

  // Styling
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableSearch = false,
  searchPlaceholder,
  onSearch,
  manualFiltering = false,
  pageCount,
  actions = [],
  manualPagination = false,
  pagination: externalPagination, // Renamed for clarity
  onPaginationChange,
  totalCount,
  isLoading = false,
  enableSorting = true,
  enableColumnVisibility = false,
  renderSubComponent,
  getRowCanExpand,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Only use internal state if external is not provided
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 10,
    }
  );

  const pagination = externalPagination || internalPagination;
  const handlePaginationChange = onPaginationChange || setInternalPagination;

  const handleGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
    const value =
      typeof updaterOrValue === "function"
        ? updaterOrValue(globalFilter)
        : updaterOrValue;
    setGlobalFilter(value);
    onSearch?.(value);
  };

  const table = useReactTable({
    data,
    columns,
    // Pagination
    pageCount: pageCount,
    manualPagination,
    onPaginationChange: handlePaginationChange,
    // Sorting
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    // Filtering
    manualFiltering,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: handleGlobalFilterChange,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Column visibility
    onColumnVisibilityChange: enableColumnVisibility
      ? setColumnVisibility
      : undefined,
    // Row selection
    onRowSelectionChange: setRowSelection,
    // Expansion
    getRowCanExpand,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
      expanded,
    },
  });

  // const hasExpansion = !!renderSubComponent;
  const hasActions = actions.some((a) => !a.isAdd && a.show !== false);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar with Search */}
      {enableSearch && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          actions={actions}
        />
      )}

      {/* Table with horizontal scroll on mobile */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <caption className="sr-only">
              Data table with sorting and pagination
            </caption>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                  {hasActions && (
                    <TableHead className="text-center w-[80px]">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: pagination.pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell className="text-center">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                      {hasActions && (
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {actions
                                .filter(
                                  (a) =>
                                    (a.group === "action" || !a.isAdd) &&
                                    a.show !== false
                                )
                                .map((action, idx) => {
                                  if (action.isSeparator) {
                                    return <DropdownMenuSeparator key={idx} />;
                                  }
                                  return (
                                    <DropdownMenuItem
                                      key={idx}
                                      onClick={() =>
                                        action.onClick?.(row.original as TData)
                                      }
                                      className={action.className}
                                      disabled={
                                        typeof action.disabled === "function"
                                          ? action.disabled(
                                            row.original as TData
                                          )
                                          : action.disabled
                                      }
                                    >
                                      {action.icon && (
                                        <span className="mr-2">
                                          {action.icon}
                                        </span>
                                      )}
                                      {action.label}
                                    </DropdownMenuItem>
                                  );
                                })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                    {row.getIsExpanded() && renderSubComponent && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30 border-t-0">
                        <TableCell
                          colSpan={
                            row.getVisibleCells().length + (hasActions ? 1 : 0)
                          }
                          className="p-0"
                        >
                          {renderSubComponent({ row })}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && table.getRowModel().rows?.length > 0 && (
        <DataTablePagination table={table} totalCount={totalCount} />
      )}
    </div>
  );
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 cursor-pointer select-none hover:text-foreground",
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="h-4 w-4" />
    </div>
  );
}
