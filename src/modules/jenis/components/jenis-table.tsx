import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { formatRupiah } from "@/lib/utils";
import { Jenis } from "../types/jenis.schema";
import { useModalStore } from "@/stores/modal-store";
import { JenisForm } from "./jenis-form";
import { JenisDetail } from "./jenis-detail";
import { JenisDelete } from "./jenis-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { jenisService } from "../services/jenis.service";

export const JenisTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view", row?: Jenis) => {
      switch (type) {
        case "create":
          onOpen("form", {
            title: "Add Jenis",
            size: "lg",
            content: <JenisForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "Jenis Details",
              size: "lg",
              position: "top",
              content: <JenisDetail jenis={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit Jenis",
              size: "lg",
              content: <JenisForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete Jenis",
              size: "lg",
              content: <JenisDelete jenis={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<Jenis>[] = useMemo(
    () => [
      {
        label: "Add Jenis",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: Jenis) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit Jenis",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: Jenis) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: Jenis) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
    ],
    [handleAction]
  );

  const columns: ColumnDef<Jenis>[] = useMemo(
    () => [
      {
        accessorKey: "kodeJenis",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Jenis" />,
        
        
        
      },
      {
        accessorKey: "namaJenis",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Jenis" />,
        
        
        
      },
      {
        accessorKey: "kodeGroup",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Group" />,
        
        
        
      },
    ],
    []
  );

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/jenis"
      dataPath="jenis"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search jeniss..."
    />
  );
};
