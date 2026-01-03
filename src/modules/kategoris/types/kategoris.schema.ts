import { z } from "zod";

export const kategoriSchema = z.object({
  kodeGroup: z.string(),
  namaGroup: z.string(),
  jenisGroup: z.string(),
  harga: z.coerce.number(),
  hargaModal: z.coerce.number(),
  kodeWarnaNota: z.string(),
});

export type KategoriFormData = z.infer<typeof kategoriSchema>;

export type Kategori = {
  id: number;
  kodeGroup: string;
  namaGroup: string;
  jenisGroup: string;
  harga: number;
  hargaModal: number;
  kodeWarnaNota: string;

  createdAt?: string;
  updatedAt?: string;
};
