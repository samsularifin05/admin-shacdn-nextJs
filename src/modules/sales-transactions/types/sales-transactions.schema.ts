import { z } from "zod";

export const salesTransactionSchema = z.object({
  transactionCode: z.string().optional().transform(v => v?.toUpperCase()),
  barcode: z.string().optional().transform(v => v?.toUpperCase()),
  customerName: z.string().min(1, 'Required').transform(v => v?.toUpperCase()),
  totalAmount: z.coerce.number().optional(),
});

export type SalesTransactionFormData = z.infer<typeof salesTransactionSchema>;

export type SalesTransaction = {
  id: number;
  transactionCode?: string;
  barcode?: string;
  customerName: string;
  totalAmount?: number;

  createdAt?: string;
  updatedAt?: string;
};
