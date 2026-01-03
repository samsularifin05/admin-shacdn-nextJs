import { z } from "zod";

export const barangSchema = z.object({
  kategori: z.coerce.number(),
  jenis: z.coerce.number(),
  kodeBaki: z.coerce.number(),
  barangSepuhan: z.enum(["TIDAK","YA"]),
  stockSepuh: z.coerce.number(),
  beratSepuh: z.coerce.number(),
  kodeIntern: z.string(),
  markis: z.enum(["TIDAK","YA"]),
  namaBarang: z.string(),
  beratAsli: z.coerce.number(),
  berat: z.coerce.number(),
  kadarCetak: z.string(),
  attributeName: z.string(),
  beratAtribut: z.coerce.number(),
  hargaAtribut: z.coerce.number(),
  beratPlastik: z.coerce.number(),
  size: z.string(),
});

export type BarangFormData = z.infer<typeof barangSchema>;

export type Barang = {
  id: number;
  kategori: number;
  jenis: number;
  kodeBaki: number;
  barangSepuhan: "TIDAK" | "YA";
  stockSepuh: number;
  beratSepuh: number;
  kodeIntern: string;
  markis: "TIDAK" | "YA";
  namaBarang: string;
  beratAsli: number;
  berat: number;
  kadarCetak: string;
  attributeName: string;
  beratAtribut: number;
  hargaAtribut: number;
  beratPlastik: number;
  size: string;
  kategoriRel?: any;
  jenisRel?: any;
  kodeBakiRel?: any;
  createdAt?: string;
  updatedAt?: string;
};
