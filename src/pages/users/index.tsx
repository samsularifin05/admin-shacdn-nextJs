import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";

// Sample data type
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
};

// Generate more sample data for pagination demo
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

const users = generateUsers(50); // Generate 50 users for pagination demo

// Column definitions
const columns: ColumnDef<User>[] = [
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
    cell: () => {
      return (
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export default function UsersPage() {
  const [isLoading] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your users and their permissions
          </p>
        </div>
        <Button>
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
          {/* Client-side pagination example */}
          <DataTable
            columns={columns}
            data={users}
            enableSearch
            searchPlaceholder="Search all columns..."
            isLoading={isLoading}
            enableSorting
            enableColumnVisibility
          />
        </CardContent>
      </Card>

      {/* Example of server-side pagination (commented out) */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Server-Side Pagination Example</CardTitle>
          <CardDescription>
            Data fetched from API with server-side pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={serverData}
            pageCount={totalPages}
            manualPagination
            onPaginationChange={(updater) => {
              const newPagination = typeof updater === 'function' 
                ? updater(pagination) 
                : updater;
              setPagination(newPagination);
              // Fetch data from API with new pagination
              fetchUsers(newPagination.pageIndex, newPagination.pageSize);
            }}
            isLoading={isLoadingServer}
          />
        </CardContent>
      </Card>
      */}
    </div>
  );
}
