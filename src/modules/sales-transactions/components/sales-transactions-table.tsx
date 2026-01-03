import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye, Printer } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { formatRupiah } from "@/lib/utils";
import { SalesTransaction } from "../types/sales-transactions.schema";
import { useModalStore } from "@/stores/modal-store";
import { SalesTransactionForm } from "./sales-transactions-form";
import { SalesTransactionDetail } from "./sales-transactions-detail";
import { SalesTransactionDelete } from "./sales-transactions-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { salesTransactionService } from "../services/sales-transactions.service";

export const SalesTransactionTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view" | "reprint", row?: SalesTransaction) => {
      switch (type) {
        case "reprint":
          if (row) {
            const printUrl = `/admin/print/sales-transactions/${row.id}`;
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = printUrl;
            document.body.appendChild(iframe);
            
            // Cleanup iframe after some time
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 5000);
          }
          break;
        case "create":
          onOpen("form", {
            title: "Add Sales Transaction",
            size: "lg",
            content: <SalesTransactionForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "Sales Transaction Details",
              size: "lg",
              position: "top",
              content: <SalesTransactionDetail salesTransaction={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit Sales Transaction",
              size: "lg",
              content: <SalesTransactionForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete Sales Transaction",
              size: "lg",
              content: <SalesTransactionDelete salesTransaction={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<SalesTransaction>[] = useMemo(
    () => [
      {
        label: "Add Sales Transaction",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: SalesTransaction) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit SalesTransaction",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: SalesTransaction) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: SalesTransaction) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
      {
        label: "Print Receipt",
        icon: <Printer className="h-4 w-4" />,
        onClick: (row?: SalesTransaction) => handleAction("reprint", row),
        show: true,
        group: "action",
      },
    ],
    [handleAction]
  );

  const columns: ColumnDef<SalesTransaction>[] = useMemo(
    () => [
      {
        accessorKey: "transactionCode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction Code" />,
        
        
        
      },
      {
        accessorKey: "barcode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Barcode" />,
        
        
        
      },
      {
        accessorKey: "namaBarang",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Barang" />,
        
        
        
      },
      {
        accessorKey: "berat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat" />,
        
        
        
      },
      {
        accessorKey: "harga",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga" />,
        
        cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.getValue("harga"))}</div>,
        
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer Name" />,
        
        
        
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Amount" />,
        
        cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.getValue("totalAmount"))}</div>,
        
      },
    ],
    []
  );

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/sales-transactions"
      dataPath="sales-transactions"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search salestransactions..."
    />
  );
};
