import { PageLayout } from "@/components/page-layout";
import { BakiTable } from "@/modules/bakis/components/bakis-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function BakiPage() {
  return (
    <PageLayout
      title="Bakis"
      description="Manage your bakis"
    >
      <PanelAdmin
        title="All Bakis"
        description="List of all bakis"
      >
        <BakiTable />
      </PanelAdmin>
    </PageLayout>
  );
};
