import { PageLayout } from "@/components/page-layout";
import { BarangTable } from "@/modules/barangs/components/barangs-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function BarangPage() {
  return (
    <PageLayout
      title="Barangs"
      description="Manage your barangs"
    >
      <PanelAdmin
        title="All Barangs"
        description="List of all barangs"
      >
        <BarangTable />
      </PanelAdmin>
    </PageLayout>
  );
};
