import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Eye } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { User } from "../types/user.schema";
import { useModalStore } from "@/stores/modal-store";
import { UserForm } from "./user-form";
import { UserDelete } from "./user-delete";
import { UserDetail } from "./user-detail";
import { userService } from "../services/user.service";

export const UserTable = () => {
  const { onOpen } = useModalStore();

  // Local State for Client-Side Fetching
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Refs for preventing double fetching in Strict Mode
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef<string>("");

  /**
   * Fetch users from API
   */
  const fetchUsers = useCallback(async () => {
    const page = pagination.pageIndex + 1;
    const limit = pagination.pageSize;

    // Create a unique key for the current request
    const requestKey = `${page}-${limit}`;

    // Prevent double fetching if:
    // 1. Aleady fetching
    // 2. Same request key as last successful fetch (optional, but good for avoiding redundant calls)
    if (isFetchingRef.current) return;

    // Mark as fetching
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const result = await userService.getUsers(page, limit);

      setData(result.users);
      setTotalCount(result.meta.total);
      setTotalPages(result.meta.totalPages);

      // Update last fetch ref
      lastFetchRef.current = requestKey;
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  /**
   * Effect to trigger fetch on pagination change
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      content: <UserForm initialData={user} onSuccess={fetchUsers} />,
    });
  };

  const handleDeleteUser = (user: User) => {
    onOpen("delete", {
      title: "Delete User",
      size: "sm",
      content: <UserDelete user={user} onSuccess={fetchUsers} />,
    });
  };

  const handleAddUser = () => {
    onOpen("form", {
      title: "Add New User",
      size: "md",
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
