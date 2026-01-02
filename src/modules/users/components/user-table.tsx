import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Eye } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { User } from "../types/user.schema";
import { useModalStore } from "@/stores/modal-store";
import { userService } from "../services/user.service";
import { UserForm } from "./user-form";
import { UserDelete } from "./user-delete";
import { UserDetail } from "./user-detail";

export const UserTable = () => {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Single source of truth for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { onOpen } = useModalStore();

  // Ref to prevent double-fetching on mount (StrictMode)
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef<string>("");

  const fetchUsers = useCallback(async (page: number, limit: number) => {
    const fetchKey = `${page}-${limit}`;

    // Avoid double fetch if same parameters and not a manual refresh
    if (lastFetchRef.current === fetchKey && isFetchingRef.current) return;

    isFetchingRef.current = true;
    lastFetchRef.current = fetchKey;
    setIsLoading(true);

    try {
      console.log(`[UserTable] Fetching: Page ${page}, Limit ${limit}`);
      const result = await userService.getUsers(page, limit);
      setData(result.users);
      setTotalCount(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Effect triggered on mount and pagination changes
  useEffect(() => {
    fetchUsers(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize, fetchUsers]);

  const refreshData = () => {
    lastFetchRef.current = ""; // Reset ref to force refresh
    fetchUsers(pagination.pageIndex + 1, pagination.pageSize);
  };

  const handleViewUser = (user: User) => {
    onOpen("view", {
      title: "User Details",
      size: "lg",
      position: "top",
      content: <UserDetail user={user} />,
    });
  };

  const handleEditUser = (user: User) => {
    onOpen("form", {
      title: "Edit User",
      size: "md",
      content: <UserForm initialData={user} onSuccess={refreshData} />,
    });
  };

  const handleDeleteUser = (user: User) => {
    onOpen("delete", {
      title: "Delete User",
      size: "sm",
      content: <UserDelete user={user} onSuccess={refreshData} />,
    });
  };

  const handleAddUser = () => {
    onOpen("form", {
      title: "Add New User",
      size: "md",
      content: <UserForm onSuccess={refreshData} />,
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
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: User) => row && handleDeleteUser(row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
    ],
    []
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
      data={data}
      enableSearch
      searchPlaceholder="Search users..."
      isLoading={isLoading}
      actions={tableActions}
      enableSorting
      enableColumnVisibility
      manualPagination
      pageCount={totalPages}
      totalCount={totalCount}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};

UserTable.displayName = "UserTable";
