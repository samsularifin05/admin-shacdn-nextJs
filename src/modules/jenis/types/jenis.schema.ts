import { z } from "zod";

export const jenisSchema = z.object({
  kodeJenis: z.string().min(1, 'Required').transform(v => v?.toUpperCase()),
  namaJenis: z.string().min(1, 'Required').transform(v => v?.toUpperCase()),
  kodeGroup: z.coerce.number().optional().nullable(),
});

export type JenisFormData = z.infer<typeof jenisSchema>;

export type Jenis = {
  id: number;
  kodeJenis: string;
  namaJenis: string;
  kodeGroup?: number;
  kodeGroupRel?: any;
  createdAt?: string;
  updatedAt?: string;
};
