import { Bank } from "../types/banks.schema";

interface BankDetailProps {
  bank: Bank;
}

export const BankDetail = ({ bank: row }: BankDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
          <p className="text-sm font-semibold">{row.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Bank Code</p>
          <p className="text-sm font-semibold">{row.code}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Category</p>
          <p className="text-sm font-semibold">{row.category}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Default Balance</p>
          <p className="text-sm font-semibold">{row.balance}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
          <p className="text-sm font-semibold">{row.conversionRate}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Total Value (Calculated)</p>
          <p className="text-sm font-semibold">{row.totalValue}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bank details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
