import { PageLayout } from "@/components/page-layout";
import { SalesTransactionTable } from "@/modules/sales-transactions/components/sales-transactions-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function SalesTransactionPage() {
  return (
    <PageLayout
      title="SalesTransactions"
      description="Manage your salestransactions"
    >
      <PanelAdmin
        title="All SalesTransactions"
        description="List of all salestransactions"
      >
        <SalesTransactionTable />
      </PanelAdmin>
    </PageLayout>
  );
};
