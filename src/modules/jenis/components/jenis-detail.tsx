import { Jenis } from "../types/jenis.schema";

interface JenisDetailProps {
  jenis: Jenis;
}

export const JenisDetail = ({ jenis: row }: JenisDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Jenis</p>
          <p className="text-sm font-semibold">{row.kodeJenis}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Nama Jenis</p>
          <p className="text-sm font-semibold">{row.namaJenis}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Group</p>
          <p className="text-sm font-semibold">{(row as any).kodeGroupRel?.kodeGroup || row.kodeGroup}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Jenis details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
