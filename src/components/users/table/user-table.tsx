import { ColumnDef } from "@tanstack/react-table";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, UserCheck } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "../dto/user.schema";
import { userService } from "../services/user.service";
import { useModalStore } from "@/stores/modal-store";
import { UserForm } from "../form/user-form";
import { UserDelete } from "../delete/user-delete";

export const UserTable = forwardRef((props, ref) => {
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

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchUsers,
  }));

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: User) => {
    onOpen("form", {
      title: "Edit User",
      description: `Updating information for ${user.name}`,
      content: <UserForm initialData={user} onSuccess={fetchUsers} />,
    });
  };

  const handleDeleteUser = (user: User) => {
    onOpen("delete", {
      title: "Delete User",
      description: "Confirmation Required",
      content: <UserDelete user={user} onSuccess={fetchUsers} />,
      // Footer is now handled inside UserDelete component for better encapsulation
    });
  };

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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => alert(`Status toggled for ${user.name}`)}
                >
                  <UserCheck className="mr-2 h-4 w-4" /> Toggle Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteUser(user)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      enableSorting
      enableColumnVisibility
    />
  );
});

UserTable.displayName = "UserTable";
