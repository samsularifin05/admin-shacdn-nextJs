import { PageLayout } from "@/components/page-layout";
import { BankTable } from "@/modules/banks/components/banks-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function BankPage() {
  return (
    <PageLayout
      title="Banks"
      description="Manage your banks"
    >
      <PanelAdmin
        title="All Banks"
        description="List of all banks"
      >
        <BankTable />
      </PanelAdmin>
    </PageLayout>
  );
};
