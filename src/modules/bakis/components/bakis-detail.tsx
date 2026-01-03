import { Baki } from "../types/bakis.schema";

interface BakiDetailProps {
  baki: Baki;
}

export const BakiDetail = ({ baki: row }: BakiDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Gudang</p>
          <p className="text-sm font-semibold">{row.kodeGudang}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Baki</p>
          <p className="text-sm font-semibold">{row.kodeBaki}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Nama Baki</p>
          <p className="text-sm font-semibold">{row.namaBaki}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Berat Baki</p>
          <p className="text-sm font-semibold">{row.beratBaki}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Berat Bandrol</p>
          <p className="text-sm font-semibold">{row.beratBandrol}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Baki details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
