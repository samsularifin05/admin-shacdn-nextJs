import { PageLayout } from "@/components/page-layout";
import { KategoriTable } from "@/modules/kategoris/components/kategoris-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function KategoriPage() {
  return (
    <PageLayout
      title="Kategoris"
      description="Manage your kategoris"
    >
      <PanelAdmin
        title="All Kategoris"
        description="List of all kategoris"
      >
        <KategoriTable />
      </PanelAdmin>
    </PageLayout>
  );
};
