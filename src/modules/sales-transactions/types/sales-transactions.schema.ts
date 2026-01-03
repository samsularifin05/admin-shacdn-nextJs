import { z } from "zod";

export const salesTransactionSchema = z.object({
  transactionCode: z.string().optional().transform(v => v?.toUpperCase()),
  transactionDate: z.string().optional().transform(v => v?.toUpperCase()),
  customerName: z.string().optional().transform(v => v?.toUpperCase()),
  items: z.array(z.object({ barangId: z.coerce.number(), harga: z.coerce.number(), qty: z.coerce.number(), subtotal: z.coerce.number().optional() })).default([]).optional(),
  totalAmount: z.coerce.number().optional(),
  paymentMethod: z.enum(["TUNAI","TRANSFER","QRIS"]).optional().nullable(),
});

export type SalesTransactionFormData = z.infer<typeof salesTransactionSchema>;

export type SalesTransaction = {
  id: number;
  transactionCode?: string;
  transactionDate?: string;
  customerName?: string;
  items?: {
    barangId: number;
    harga: number;
    qty: number;
    subtotal: number;
  }[];
  totalAmount?: number;
  paymentMethod?: "TUNAI" | "TRANSFER" | "QRIS";

  createdAt?: string;
  updatedAt?: string;
};
