import { PageLayout } from "@/components/page-layout";
import { SalesTransactionTable } from "@/modules/sales-transactions/components/sales-transactions-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function SalesTransactionPage() {
  return (
    <PageLayout
      title="Sales Transactions"
      description="Manage your sales transactions"
    >
      <PanelAdmin
        title="All Sales Transactions"
        description="List of all sales transactions"
      >
        <SalesTransactionTable />
      </PanelAdmin>
    </PageLayout>
  );
};
