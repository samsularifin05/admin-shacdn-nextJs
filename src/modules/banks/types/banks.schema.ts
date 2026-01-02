import { z } from "zod";

export const bankSchema = z.object({
  code: z.string(),
  name: z.string().min(2),
  category: z.enum(["Local","International"]),
  balance: z.coerce.number(),
  conversionRate: z.coerce.number(),
  totalValue: z.coerce.number(),
  isActive: z.boolean(),
});

export type BankFormData = z.infer<typeof bankSchema>;

export type Bank = {
  id: number;
  code: string;
  name: string;
  category: "Local" | "International";
  balance: number;
  conversionRate: number;
  totalValue: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
