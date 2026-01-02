import { z } from "zod";

export const bankSchema = z.object({
  name: z.string().min(2),
  code: z.string(),
  category: z.enum(["Local","International"]),
  balance: z.coerce.number(),
  conversionRate: z.coerce.number(),
  totalValue: z.coerce.number(),
  isActive: z.boolean(),
});

export type BankFormData = z.infer<typeof bankSchema>;

export type Bank = {
  id: number;
  name: string;
  code: string;
  category: "Local" | "International";
  balance: number;
  conversionRate: number;
  totalValue: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
