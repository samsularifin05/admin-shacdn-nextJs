import { Kategori } from "../types/kategoris.schema";

interface KategoriDetailProps {
  kategori: Kategori;
}

export const KategoriDetail = ({ kategori: row }: KategoriDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Group</p>
          <p className="text-sm font-semibold">{row.kodeGroup}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Nama Group</p>
          <p className="text-sm font-semibold">{row.namaGroup}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Jenis Group</p>
          <p className="text-sm font-semibold">{row.jenisGroup}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Harga</p>
          <p className="text-sm font-semibold">{row.harga}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Harga Modal</p>
          <p className="text-sm font-semibold">{row.hargaModal}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Warna Nota</p>
          <p className="text-sm font-semibold">{row.kodeWarnaNota}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Kategori details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
