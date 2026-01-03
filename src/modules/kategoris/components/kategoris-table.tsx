import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { formatRupiah } from "@/lib/utils";
import { Kategori } from "../types/kategoris.schema";
import { useModalStore } from "@/stores/modal-store";
import { KategoriForm } from "./kategoris-form";
import { KategoriDetail } from "./kategoris-detail";
import { KategoriDelete } from "./kategoris-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { kategoriService } from "../services/kategoris.service";

export const KategoriTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view", row?: Kategori) => {
      switch (type) {
        
        case "create":
          onOpen("form", {
            title: "Add Kategori",
            size: "lg",
            content: <KategoriForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "Kategori Details",
              size: "lg",
              position: "top",
              content: <KategoriDetail kategori={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit Kategori",
              size: "lg",
              content: <KategoriForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete Kategori",
              size: "lg",
              content: <KategoriDelete kategori={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<Kategori>[] = useMemo(
    () => [
      {
        label: "Add Kategori",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: Kategori) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit Kategori",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: Kategori) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: Kategori) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
      
    ],
    [handleAction]
  );

  const columns: ColumnDef<Kategori>[] = useMemo(
    () => [
      {
        accessorKey: "kodeGroup",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Group" />,
        
        
        
      },
      {
        accessorKey: "namaGroup",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Group" />,
        
        
        
      },
      {
        accessorKey: "jenisGroup",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis Group" />,
        
        
        
      },
      {
        accessorKey: "harga",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga" />,
        
        cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.getValue("harga"))}</div>,
        
      },
      {
        accessorKey: "hargaModal",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Modal" />,
        
        cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.getValue("hargaModal"))}</div>,
        
      },
      {
        accessorKey: "kodeWarnaNota",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Warna Nota" />,
        
        
        
      },
    ],
    []
  );

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/kategoris"
      dataPath="kategoris"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search kategoris..."
    />
  );
};
