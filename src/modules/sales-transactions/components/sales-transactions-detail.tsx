import { SalesTransaction } from "../types/sales-transactions.schema";

interface SalesTransactionDetailProps {
  salesTransaction: SalesTransaction;
}

export const SalesTransactionDetail = ({ salesTransaction: row }: SalesTransactionDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kode Barcode</p>
          <p className="text-sm font-semibold">{row.kodeBarcode}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Nama Barang</p>
          <p className="text-sm font-semibold">{row.namaBarang}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Bank</p>
          <p className="text-sm font-semibold">{row.bankId}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Attribute Name</p>
          <p className="text-sm font-semibold">{row.attributeName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Kadar (%)</p>
          <p className="text-sm font-semibold">{row.kadar}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Harga Sekarang</p>
          <p className="text-sm font-semibold">{row.hargaSkrg}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          SalesTransaction details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
