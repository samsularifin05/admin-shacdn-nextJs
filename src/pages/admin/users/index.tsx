import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  UserPlus,
  Pencil,
  Trash2,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { PageLayout } from "@/components/page-layout";
import { useModalStore } from "@/stores/modal-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserForm, type UserFormData } from "@/components/users/user-form";

// Sample data type
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
};

// Generate more sample data
const generateUsers = (count: number): User[] => {
  const roles = ["Admin", "User", "Editor", "Viewer"];
  const statuses: ("Active" | "Inactive")[] = ["Active", "Inactive"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const initialUsers = generateUsers(50);

export default function UsersPage() {
  const [isLoading] = useState(false);
  const { onOpen, onClose } = useModalStore();

  const handleUserModal = (user?: User) => {
    onOpen("form", {
      title: user ? "Edit User" : "Add New User",
      description: user
        ? `Updating information for ${user.name}`
        : "Enter the details of the new user below.",
      content: (
        <UserForm
          initialData={user as UserFormData}
          onSubmit={(data) => {
            alert(
              `Success! ${user ? "Updated" : "Created"} user: ${data.name}`
            );
            onClose();
          }}
        />
      ),
    });
  };

  const handleDeleteUser = (user: User) => {
    onOpen("delete", {
      title: "Delete User",
      description:
        "This action cannot be undone. Are you sure you want to delete this user?",
      content: (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
          <ShieldAlert className="h-5 w-5" />
          <p className="text-sm font-medium">
            Deleting user: <strong>{user.name}</strong>
          </p>
        </div>
      ),
      footer: (
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              alert("User deleted (simulated)");
              onClose();
            }}
          >
            Confirm Delete
          </Button>
        </>
      ),
    });
  };

  // Column definitions moved inside to access handlers
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
                <DropdownMenuItem onClick={() => handleUserModal(user)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    alert(`Status toggled for ${user.name}`);
                  }}
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
    <PageLayout
      title="Users"
      description="Manage your users and their permissions"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage your users and their permissions
            </p>
          </div>
          <Button onClick={() => handleUserModal()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A list of all users in your account with sorting and pagination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={initialUsers}
              enableSearch
              searchPlaceholder="Search all columns..."
              isLoading={isLoading}
              enableSorting
              enableColumnVisibility
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
