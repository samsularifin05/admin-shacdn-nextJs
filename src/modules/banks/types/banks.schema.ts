import { z } from "zod";

export const bankSchema = z.object({
  code: z.string().min(1, 'Required').transform(v => v?.toUpperCase()),
  name: z.string().min(1, 'Required').transform(v => v?.toUpperCase()),
  category: z.enum(["Local","International"]),
  balance: z.coerce.number().optional(),
  conversionRate: z.coerce.number().optional(),
  totalValue: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

export type BankFormData = z.infer<typeof bankSchema>;

export type Bank = {
  id: number;
  code: string;
  name: string;
  category: "Local" | "International";
  balance?: number;
  conversionRate?: number;
  totalValue?: number;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
};
