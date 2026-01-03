import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye, Printer, ChevronRight, ChevronDown } from "lucide-react";
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
            size: "xl",
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
              size: "xl",
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
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return (
            <button
              onClick={() => row.toggleExpanded()}
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          );
        },
      },
      {
        accessorKey: "transactionCode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="No. Transaksi" />,
        
        
        
      },
      {
        accessorKey: "transactionDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
        
        
        
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Pelanggan" />,
        
        
        
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Bayar" />,
        
        cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.getValue("totalAmount"))}</div>,
        
      },
      {
        accessorKey: "paymentMethod",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Metode Bayar" />,
        
        
        
      },
    ],
    []
  );

  const renderSubComponent = ({ row }: { row: any }) => {
    const data = row.original;
    const items = data.items || [];

    if (items.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground italic">
          No items found.
        </div>
      );
    }

    return (
      <div className="p-4 bg-muted/20 border-y border-dashed">
        <div className="overflow-hidden rounded-md border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Barang</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Harga</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Qty</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-4 py-2">{item.barangIdRel?.namaBarang || item.barangId}</td>
                  <td className="px-4 py-2">{formatRupiah(item.harga)}</td>
                  <td className="px-4 py-2">{item.qty}</td>
                  <td className="px-4 py-2">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/sales-transactions"
      dataPath="sales-transactions"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search salestransactions..."
      renderSubComponent={renderSubComponent}
      getRowCanExpand={() => true}
    />
  );
};
