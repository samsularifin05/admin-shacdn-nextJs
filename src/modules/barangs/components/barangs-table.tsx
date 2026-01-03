import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { formatRupiah } from "@/lib/utils";
import { Barang } from "../types/barangs.schema";
import { useModalStore } from "@/stores/modal-store";
import { BarangForm } from "./barangs-form";
import { BarangDetail } from "./barangs-detail";
import { BarangDelete } from "./barangs-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { barangService } from "../services/barangs.service";

export const BarangTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view", row?: Barang) => {
      switch (type) {
        case "create":
          onOpen("form", {
            title: "Add Barang",
            size: "lg",
            content: <BarangForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "Barang Details",
              size: "lg",
              position: "top",
              content: <BarangDetail barang={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit Barang",
              size: "lg",
              content: <BarangForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete Barang",
              size: "lg",
              content: <BarangDelete barang={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<Barang>[] = useMemo(
    () => [
      {
        label: "Add Barang",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: Barang) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit Barang",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: Barang) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: Barang) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
    ],
    [handleAction]
  );

  const columns: ColumnDef<Barang>[] = useMemo(
    () => [
      {
        accessorKey: "kategori",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kategori" />,
        
        
        cell: ({ row }) => {
                const original = row.original as any;
                const rel = original.kategoriRel;
                return <div>{rel ? rel.kodeGroup : row.getValue("kategori")}</div>;
              },
      },
      {
        accessorKey: "jenis",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis" />,
        
        
        cell: ({ row }) => {
                const original = row.original as any;
                const rel = original.jenisRel;
                return <div>{rel ? rel.kodeJenis : row.getValue("jenis")}</div>;
              },
      },
      {
        accessorKey: "kodeBaki",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Baki" />,
        
        
        cell: ({ row }) => {
                const original = row.original as any;
                const rel = original.kodeBakiRel;
                return <div>{rel ? rel.kodeBaki : row.getValue("kodeBaki")}</div>;
              },
      },
      {
        accessorKey: "barangSepuhan",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Barang Sepuhan" />,
        
        
        
      },
      {
        accessorKey: "stockSepuh",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stock Sepuh" />,
        
        
        
      },
      {
        accessorKey: "beratSepuh",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Sepuh" />,
        
        
        
      },
      {
        accessorKey: "kodeIntern",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Intern" />,
        
        
        
      },
      {
        accessorKey: "markis",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Markis" />,
        
        
        
      },
      {
        accessorKey: "namaBarang",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Barang" />,
        
        
        
      },
      {
        accessorKey: "beratAsli",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Asli" />,
        
        
        
      },
      {
        accessorKey: "berat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat" />,
        
        
        
      },
      {
        accessorKey: "kadarCetak",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kadar Cetak" />,
        
        
        
      },
      {
        accessorKey: "attributeName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Attribute Name" />,
        
        
        
      },
      {
        accessorKey: "beratAtribut",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Atribut" />,
        
        
        
      },
      {
        accessorKey: "hargaAtribut",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Atribut" />,
        
        cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.getValue("hargaAtribut"))}</div>,
        
      },
      {
        accessorKey: "beratPlastik",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Plastik" />,
        
        
        
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
      endpoint="/api/barangs"
      dataPath="barangs"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search barangs..."
    />
  );
};
