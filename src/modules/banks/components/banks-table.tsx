import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { Bank } from "../types/banks.schema";
import { useModalStore } from "@/stores/modal-store";
import { BankForm } from "./banks-form";
import { BankDetail } from "./banks-detail";
import { BankDelete } from "./banks-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { bankService } from "../services/banks.service";

export const BankTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view", row?: Bank) => {
      switch (type) {
        case "create":
          onOpen("form", {
            title: "Add Bank",
            size: "md",
            content: <BankForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "Bank Details",
              size: "lg",
              position: "top",
              content: <BankDetail bank={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit Bank",
              size: "md",
              content: <BankForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete Bank",
              size: "md",
              content: <BankDelete bank={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<Bank>[] = useMemo(
    () => [
      {
        label: "Add Bank",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: Bank) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit Bank",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: Bank) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: Bank) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
    ],
    [handleAction]
  );

  const columns: ColumnDef<Bank>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bank Name" />,
        
        
      },
      {
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bank Code" />,
        
        
      },
      {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        
        
      },
      {
        accessorKey: "balance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Default Balance" />,
        
        cell: ({ row }) => <div>{row.getValue("balance")}</div>,
      },
      {
        accessorKey: "conversionRate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Conversion Rate" />,
        
        cell: ({ row }) => <div>{row.getValue("conversionRate")}</div>,
      },
      {
        accessorKey: "totalValue",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Value (Calculated)" />,
        
        cell: ({ row }) => <div>{row.getValue("totalValue")}</div>,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Active Status" />,
        cell: ({ row }) => <div>{row.getValue("isActive") ? "Yes" : "No"}</div>,
        
      },
    ],
    []
  );

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/banks"
      dataPath="banks"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search banks..."
    />
  );
};
