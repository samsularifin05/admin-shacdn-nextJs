import { PageLayout } from "@/components/page-layout";
import { JenisTable } from "@/modules/jenis/components/jenis-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function JenisPage() {
  return (
    <PageLayout
      title="Jeniss"
      description="Manage your jeniss"
    >
      <PanelAdmin
        title="All Jeniss"
        description="List of all jeniss"
      >
        <JenisTable />
      </PanelAdmin>
    </PageLayout>
  );
};
