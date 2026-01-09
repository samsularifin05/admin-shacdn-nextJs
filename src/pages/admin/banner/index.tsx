import { PageLayout } from "@/components/page-layout";
import { BannerTable } from "@/modules/banners/components/banners-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function BannerPage() {
  return (
    <PageLayout
      title="Banner Promos"
      description="Manage your banner promos"
    >
      <PanelAdmin
        title="All Banner Promos"
        description="List of all banner promos"
      >
        <BannerTable />
      </PanelAdmin>
    </PageLayout>
  );
};
