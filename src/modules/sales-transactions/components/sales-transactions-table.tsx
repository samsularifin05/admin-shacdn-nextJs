import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
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
    (type: "create" | "update" | "delete" | "view", row?: SalesTransaction) => {
      switch (type) {
        case "create":
          onOpen("form", {
            title: "Add SalesTransaction",
            size: "lg",
            content: <SalesTransactionForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "SalesTransaction Details",
              size: "lg",
              position: "top",
              content: <SalesTransactionDetail salesTransaction={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit SalesTransaction",
              size: "lg",
              content: <SalesTransactionForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete SalesTransaction",
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
        label: "Add SalesTransaction",
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
    ],
    [handleAction]
  );

  const columns: ColumnDef<SalesTransaction>[] = useMemo(
    () => [
      {
        accessorKey: "kodeBarcode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Barcode" />,
        
        
      },
      {
        accessorKey: "namaBarang",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Barang" />,
        
        
      },
      {
        accessorKey: "attributeName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Attribute Name" />,
        
        
      },
      {
        accessorKey: "kadar",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kadar (%)" />,
        
        cell: ({ row }) => <div>{row.getValue("kadar")}</div>,
      },
      {
        accessorKey: "hargaSkrg",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Sekarang" />,
        
        
      },
      {
        accessorKey: "hargaAtribut",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Atribut" />,
        
        
      },
      {
        accessorKey: "beratAtribut",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Atribut (gram)" />,
        
        cell: ({ row }) => <div>{row.getValue("beratAtribut")}</div>,
      },
      {
        accessorKey: "berat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Jual (gram)" />,
        
        cell: ({ row }) => <div>{row.getValue("berat")}</div>,
      },
      {
        accessorKey: "hargaJual",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Jual (Calculated)" />,
        
        cell: ({ row }) => <div>{row.getValue("hargaJual")}</div>,
      },
      {
        accessorKey: "hargaPerGram",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga / Gram" />,
        
        cell: ({ row }) => <div>{row.getValue("hargaPerGram")}</div>,
      },
      {
        accessorKey: "ongkos",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ongkos" />,
        
        cell: ({ row }) => <div>{row.getValue("ongkos")}</div>,
      },
      {
        accessorKey: "tipeDiskon",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pilih Tipe Diskon" />,
        
        
      },
      {
        accessorKey: "discountRp",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Discount Rp" />,
        
        cell: ({ row }) => <div>{row.getValue("discountRp")}</div>,
      },
      {
        accessorKey: "total",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
        
        cell: ({ row }) => <div>{row.getValue("total")}</div>,
      },
      {
        accessorKey: "keterangan",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Keterangan" />,
        
        
      },
      {
        accessorKey: "size",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
        
        
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
