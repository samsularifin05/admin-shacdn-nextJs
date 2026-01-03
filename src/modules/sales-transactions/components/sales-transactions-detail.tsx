import { SalesTransaction } from "../types/sales-transactions.schema";

interface SalesTransactionDetailProps {
  salesTransaction: SalesTransaction;
}

export const SalesTransactionDetail = ({ salesTransaction: row }: SalesTransactionDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Transaction Code</p>
          <p className="text-sm font-semibold">{row.transactionCode}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Barcode</p>
          <p className="text-sm font-semibold">{row.barcode}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
          <p className="text-sm font-semibold">{row.customerName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
          <p className="text-sm font-semibold">{row.totalAmount}</p>
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
