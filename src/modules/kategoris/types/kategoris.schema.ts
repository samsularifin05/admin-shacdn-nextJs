import { z } from "zod";

export const kategoriSchema = z.object({
  kodeGroup: z.string().min(1, 'Required'),
  namaGroup: z.string().min(1, 'Required'),
  jenisGroup: z.string().optional(),
  harga: z.coerce.number().optional(),
  hargaModal: z.coerce.number().optional(),
  kodeWarnaNota: z.string().optional(),
});

export type KategoriFormData = z.infer<typeof kategoriSchema>;

export type Kategori = {
  id: number;
  kodeGroup: string;
  namaGroup: string;
  jenisGroup?: string;
  harga?: number;
  hargaModal?: number;
  kodeWarnaNota?: string;

  createdAt?: string;
  updatedAt?: string;
};
