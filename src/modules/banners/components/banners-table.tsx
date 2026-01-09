import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye, ChevronRight, ChevronDown } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { formatRupiah } from "@/lib/utils";
import { Banner } from "../types/banners.schema";
import { useModalStore } from "@/stores/modal-store";
import { BannerForm } from "./banners-form";
import { BannerDetail } from "./banners-detail";
import { BannerDelete } from "./banners-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { bannerService } from "../services/banners.service";

export const BannerTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view", row?: Banner) => {
      switch (type) {
        
        case "create":
          onOpen("form", {
            title: "Add Banner Promo",
            size: "xl",
            content: <BannerForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "Banner Promo Details",
              size: "lg",
              position: "top",
              content: <BannerDetail banner={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit Banner Promo",
              size: "xl",
              content: <BannerForm initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete Banner Promo",
              size: "lg",
              content: <BannerDelete banner={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<Banner>[] = useMemo(
    () => [
      {
        label: "Add Banner Promo",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: Banner) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit Banner",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: Banner) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: Banner) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
      
    ],
    [handleAction]
  );

  const columns: ColumnDef<Banner>[] = useMemo(
    () => [

      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Banner" />,
        
        
        
        
      },
      {
        accessorKey: "image",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gambar Banner" />,
        
        
        
        cell: ({ row }) => {
                const val = row.getValue("image") as string;
                if (!val) return null;
                const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(val);
                if (isImage) {
                  return (
                    <div className="flex items-center justify-center">
                      <img 
                        src={val} 
                        alt="Preview" 
                        className="h-10 w-10 object-cover rounded shadow-sm hover:scale-110 transition-transform" 
                      />
                    </div>
                  );
                }
                return <div className="text-xs text-muted-foreground truncate max-w-[100px]">{val}</div>;
              },
      },
      {
        accessorKey: "link",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Link Tujuan (URL)" />,
        
        
        
        
      },
      {
        accessorKey: "sequence",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Urutan Tampil" />,
        
        
        
        
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Aktif" />,
        cell: ({ row }) => <div>{row.getValue("isActive") ? "Yes" : "No"}</div>,
        
        
        
      },
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Keterangan" />,
        
        
        
        
      },
    ],
    []
  );

  

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/banners"
      dataPath="banners"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search banners..."
      
    />
  );
};
