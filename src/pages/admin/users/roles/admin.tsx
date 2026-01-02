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
import { MoreHorizontal, UserPlus, Shield } from "lucide-react";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { PageLayout } from "@/components/page-layout";

// Admin Role data type
type AdminRole = {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: "Active" | "Inactive";
  lastLogin: string;
};

// Generate sample admin roles data
const generateAdminRoles = (count: number): AdminRole[] => {
  const roles = ["Super Admin", "Admin", "Moderator"];
  const permissionSets = [
    ["All Permissions"],
    ["User Management", "Content Management", "Settings"],
    ["User Management", "Content Management"],
    ["Content Management", "Reports"],
  ];
  const statuses: ("Active" | "Inactive")[] = ["Active", "Inactive"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Admin ${i + 1}`,
    email: `admin${i + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    permissions:
      permissionSets[Math.floor(Math.random() * permissionSets.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastLogin: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
  }));
};

const adminRoles = generateAdminRoles(30);

// Column definitions
const columns: ColumnDef<AdminRole>[] = [
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
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "Super Admin" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 2).map((permission, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {permission}
            </Badge>
          ))}
          {permissions.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{permissions.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
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
        <Button variant="ghost" size="icon" aria-label="Action Table">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export default function AdminRolesPage() {
  const [isLoading] = useState(false);

  return (
    <PageLayout
      title="Admin Roles"
      description="Manage admin roles and permissions"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Roles</h1>
            <p className="text-muted-foreground">
              Manage administrator roles and their permissions
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminRoles.length}</div>
              <p className="text-xs text-muted-foreground">
                Active administrators
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Super Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminRoles.filter((a) => a.role === "Super Admin").length}
              </div>
              <p className="text-xs text-muted-foreground">
                With full permissions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Today
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminRoles.filter((a) => a.status === "Active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Admin Roles</CardTitle>
            <CardDescription>
              A list of all administrators with their roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={adminRoles}
              enableSearch
              searchPlaceholder="Search admins..."
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
