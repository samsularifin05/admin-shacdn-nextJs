import { Banner } from "../types/banners.schema";

interface BannerDetailProps {
  banner: Banner;
}

export const BannerDetail = ({ banner: row }: BannerDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Nama Banner</p>
          <p className="text-sm font-semibold">{row.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Gambar Banner</p>
          <p className="text-sm font-semibold">{row.image}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Link Tujuan (URL)</p>
          <p className="text-sm font-semibold">{row.link}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Urutan Tampil</p>
          <p className="text-sm font-semibold">{row.sequence}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Aktif</p>
          <p className="text-sm font-semibold">{row.isActive ? "Yes" : "No"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Keterangan</p>
          <p className="text-sm font-semibold">{row.description}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Banner details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
