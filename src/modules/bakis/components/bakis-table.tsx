import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { formatRupiah } from "@/lib/utils";
import { Baki } from "../types/bakis.schema";
import { useModalStore } from "@/stores/modal-store";
import { BakiForm } from "./bakis-form";
import { BakiDetail } from "./bakis-detail";
import { BakiDelete } from "./bakis-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { bakiService } from "../services/bakis.service";

export const BakiTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view", row?: Baki) => {
      switch (type) {
        case "create":
          onOpen("form", {
            title: "Add Baki",
            size: "lg",
            content: <BakiForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "Baki Details",
              size: "lg",
              position: "top",
              content: <BakiDetail baki={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit Baki",
              size: "lg",
              content: <BakiForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete Baki",
              size: "lg",
              content: <BakiDelete baki={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<Baki>[] = useMemo(
    () => [
      {
        label: "Add Baki",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: Baki) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit Baki",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: Baki) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: Baki) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
    ],
    [handleAction]
  );

  const columns: ColumnDef<Baki>[] = useMemo(
    () => [
      {
        accessorKey: "kodeGudang",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Gudang" />,
        
        
        
      },
      {
        accessorKey: "kodeBaki",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kode Baki" />,
        
        
        
      },
      {
        accessorKey: "namaBaki",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Baki" />,
        
        
        
      },
      {
        accessorKey: "beratBaki",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Baki" />,
        
        
        
      },
      {
        accessorKey: "beratBandrol",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Berat Bandrol" />,
        
        
        
      },
    ],
    []
  );

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/bakis"
      dataPath="bakis"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search bakis..."
    />
  );
};
