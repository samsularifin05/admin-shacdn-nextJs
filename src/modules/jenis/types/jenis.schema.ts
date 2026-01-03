import { z } from "zod";

export const jenisSchema = z.object({
  kodeJenis: z.string(),
  namaJenis: z.string(),
  kodeGroup: z.coerce.number(),
});

export type JenisFormData = z.infer<typeof jenisSchema>;

export type Jenis = {
  id: number;
  kodeJenis: string;
  namaJenis: string;
  kodeGroup: number;
  kodeGroupRel?: any;
  createdAt?: string;
  updatedAt?: string;
};
