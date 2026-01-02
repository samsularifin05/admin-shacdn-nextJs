import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Eye } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { User } from "../types/user.schema";
import { useModalStore } from "@/stores/modal-store";
import { UserForm } from "./user-form";
import { UserDelete } from "./user-delete";
import { UserDetail } from "./user-detail";

interface UserTableProps {
  initialData?: User[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const UserTable = ({ initialData = [], meta }: UserTableProps) => {
  const router = useRouter();
  const { onOpen } = useModalStore();

  // Current pagination state from URL (Source of Truth)
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: (meta?.page || 1) - 1,
      pageSize: meta?.limit || 10,
    }),
    [meta?.page, meta?.limit]
  );

  /**
   * Refresh data by re-pushing the current route
   * This triggers getServerSideProps again
   */
  const refreshData = useCallback(() => {
    router.replace(router.asPath);
  }, [router]);

  /**
   * Handle pagination change by updating URL query parameters
   * This triggers SSR on the server
   */
  const onPaginationChange = useCallback(
    (updater: any) => {
      const nextState =
        typeof updater === "function" ? updater(pagination) : updater;

      const query = { ...router.query };
      query.page = (nextState.pageIndex + 1).toString();
      query.limit = nextState.pageSize.toString();

      router.push(
        {
          pathname: router.pathname,
          query,
        },
        undefined,
        { shallow: false }
      );
    },
    [router, pagination]
  );

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
    [refreshData]
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
      data={initialData}
      enableSearch
      searchPlaceholder="Search users..."
      isLoading={false} // Data is server-side rendered, always ready
      actions={tableActions}
      enableSorting
      enableColumnVisibility
      manualPagination
      pageCount={meta?.totalPages || 0}
      totalCount={meta?.total || 0}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
    />
  );
};

UserTable.displayName = "UserTable";
