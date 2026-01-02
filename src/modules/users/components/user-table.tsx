import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Eye, UserCheck } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { User } from "../types/user.schema";
import { userService } from "../services/user.service";
import { useModalStore } from "@/stores/modal-store";
import { UserForm } from "./user-form";
import { UserDelete } from "./user-delete";
import { UserDetail } from "./user-detail";

export const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onOpen } = useModalStore();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewUser = (user: User) => {
    onOpen("view", {
      title: "User Details",
      size: "lg", // Menggunakan ukuran LG
      position: "top", // Posisi di atas
      content: <UserDetail user={user} />,
    });
  };

  const handleEditUser = (user: User) => {
    onOpen("form", {
      title: "Edit User",
      size: "md", // Menggunakan ukuran MD
      content: <UserForm initialData={user} onSuccess={fetchUsers} />,
    });
  };

  const handleDeleteUser = (user: User) => {
    onOpen("delete", {
      title: "Delete User",
      size: "sm", // Menggunakan ukuran SM
      content: <UserDelete user={user} onSuccess={fetchUsers} />,
    });
  };

  const handleAddUser = () => {
    onOpen("form", {
      title: "Add New User",
      size: "md", // Menggunakan ukuran MD
      content: <UserForm onSuccess={fetchUsers} />,
    });
  };

  const tableActions: ButtonConfig<User>[] = useMemo(
    () => [
      {
        label: "Add User",
        icon: <UserPlus className="h-4 w-4" />,
        onClick: () => handleAddUser(),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "Penjualan",
        icon: <UserPlus className="h-4 w-4" />,
        onClick: () => handleAddUser(),
        isAdd: true,
        show: true,
        group: "toolbar",
        variant: "outline",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: User) => row && handleViewUser(row),
        show: true,
        group: "action",
      },
      {
        label: "Edit User",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: User) => row && handleEditUser(row),
        show: true,
        group: "action",
      },
      {
        label: "Toggle Status",
        icon: <UserCheck className="h-4 w-4" />,
        onClick: (row?: User) => row && alert(`Status toggled for ${row.name}`),
        show: true,
        group: "action",
      },
      {
        isSeparator: true,
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: User) => row && handleDeleteUser(row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
    ],
    [fetchUsers]
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
    <DataTable
      columns={columns}
      data={users}
      enableSearch
      searchPlaceholder="Search users..."
      isLoading={isLoading}
      actions={tableActions}
      enableSorting
      enableColumnVisibility
    />
  );
};

UserTable.displayName = "UserTable";
