import { Barang } from "../types/barangs.schema";

interface BarangDetailProps {
  barang: Barang;
}

export const BarangDetail = ({ barang: row }: BarangDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Barang</p>
          <p className="text-sm font-semibold">{row.kodeBarang}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kategori</p>
          <p className="text-sm font-semibold">{(row as any).kategoriRel?.kodeGroup || row.kategori}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Jenis</p>
          <p className="text-sm font-semibold">{(row as any).jenisRel?.kodeJenis || row.jenis}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Baki</p>
          <p className="text-sm font-semibold">{(row as any).kodeBakiRel?.kodeBaki || row.kodeBaki}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Barang Sepuhan</p>
          <p className="text-sm font-semibold">{row.barangSepuhan}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Stock Sepuh</p>
          <p className="text-sm font-semibold">{row.stockSepuh}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Barang details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
