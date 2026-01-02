import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { useModalStore } from "@/stores/modal-store";
import { UserForm } from "@/components/users/form/user-form";
import { UserTable } from "@/components/users/table/user-table";
import { useRef } from "react";

export default function UsersPage() {
  const { onOpen } = useModalStore();
  const tableRef = useRef<{ refresh: () => void } | null>(null);

  const handleAddUser = () => {
    onOpen("form", {
      title: "Add New User",
      description: "Enter the details of the new user below.",
      content: <UserForm onSuccess={() => tableRef.current?.refresh()} />,
    });
  };

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
          <Button onClick={handleAddUser}>
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
            <UserTable ref={tableRef} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
