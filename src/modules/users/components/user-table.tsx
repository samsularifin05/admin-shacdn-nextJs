import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { User } from "../types/user.schema";
import { useModalStore } from "@/stores/modal-store";
import { UserForm } from "./user-form";
import { UserDelete } from "./user-delete";
import { UserDetail } from "./user-detail";
import {
  ServerDataTable,
  ServerDataTableRef,
} from "@/components/ui/server-data-table";

export const UserTable = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view", user?: User) => {
      switch (type) {
        case "create":
          onOpen("form", {
            title: "Add New User",
            size: "md",
            content: <UserForm onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (user) {
            onOpen("view", {
              title: "User Details",
              size: "lg",
              position: "top",
              content: <UserDetail user={user} />,
            });
          }
          break;
        case "update":
          if (user) {
            onOpen("form", {
              title: "Edit User",
              size: "md",
              content: <UserForm initialData={user} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (user) {
            onOpen("delete", {
              title: "Delete User",
              size: "md",
              content: <UserDelete user={user} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<User>[] = useMemo(
    () => [
      {
        label: "Add User",
        icon: <UserPlus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: User) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit User",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: User) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: User) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
    ],
    [handleAction]
  );

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={status === "Active" ? "default" : "secondary"}>
              {status}
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/users"
      dataPath="users"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search users..."
    />
  );
};

UserTable.displayName = "UserTable";
