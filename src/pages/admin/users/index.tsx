import { PageLayout } from "@/components/page-layout";
import { UserTable } from "@/components/users/table/user-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function UsersPage() {
  return (
    <PageLayout
      title="Users"
      description="Manage your users and their permissions"
    >
      <PanelAdmin
        title="All Users"
        description="A list of all users in your account with sorting and pagination"
      >
        <UserTable />
      </PanelAdmin>
    </PageLayout>
  );
}
