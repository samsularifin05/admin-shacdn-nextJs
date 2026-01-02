import { z } from "zod";

export const salesTransactionSchema = z.object({
  kodeBarcode: z.string(),
  namaBarang: z.string(),
  bankId: z.coerce.number(),
  attributeName: z.string().optional(),
  kadar: z.coerce.number(),
  hargaSkrg: z.coerce.number(),
  hargaAtribut: z.coerce.number(),
  beratAtribut: z.coerce.number(),
  berat: z.coerce.number(),
  hargaJual: z.coerce.number(),
  hargaPerGram: z.coerce.number(),
  ongkos: z.coerce.number(),
  tipeDiskon: z.enum(["Percentage","Fixed Amount","None"]),
  discountRp: z.coerce.number(),
  total: z.coerce.number(),
  keterangan: z.string().optional(),
  size: z.string().optional(),
});

export type SalesTransactionFormData = z.infer<typeof salesTransactionSchema>;

export type SalesTransaction = {
  id: number;
  kodeBarcode: string;
  namaBarang: string;
  bankId: number;
  attributeName?: string | null | undefined;
  kadar: number;
  hargaSkrg: number;
  hargaAtribut: number;
  beratAtribut: number;
  berat: number;
  hargaJual: number;
  hargaPerGram: number;
  ongkos: number;
  tipeDiskon: "Percentage" | "Fixed Amount" | "None";
  discountRp: number;
  total: number;
  keterangan?: string | null | undefined;
  size?: string | null | undefined;
  createdAt?: string;
  updatedAt?: string;
};
