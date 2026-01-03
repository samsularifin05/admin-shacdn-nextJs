import { z } from "zod";

export const barangSchema = z.object({
  kodeBarang: z.string().optional().transform(v => v?.toUpperCase()),
  kategori: z.coerce.number().optional().nullable(),
  jenis: z.coerce.number().optional().nullable(),
  kodeBaki: z.coerce.number().optional().nullable(),
  barangSepuhan: z.enum(["TIDAK","YA"]).optional().nullable(),
  stockSepuh: z.coerce.number().optional(),
  beratSepuh: z.coerce.number().optional(),
  kodeIntern: z.string().optional().transform(v => v?.toUpperCase()),
  markis: z.enum(["TIDAK","YA"]).optional().nullable(),
  namaBarang: z.string().optional().transform(v => v?.toUpperCase()),
  beratAsli: z.coerce.number().optional(),
  berat: z.coerce.number().optional(),
  kadarCetak: z.string().optional().transform(v => v?.toUpperCase()),
  attributeName: z.string().optional().transform(v => v?.toUpperCase()),
  beratAtribut: z.coerce.number().optional(),
  hargaAtribut: z.coerce.number().optional(),
  beratPlastik: z.coerce.number().optional(),
  size: z.string().optional().transform(v => v?.toUpperCase()),
});

export type BarangFormData = z.infer<typeof barangSchema>;

export type Barang = {
  id: number;
  kodeBarang?: string;
  kategori?: number;
  jenis?: number;
  kodeBaki?: number;
  barangSepuhan?: "TIDAK" | "YA";
  stockSepuh?: number;
  beratSepuh?: number;
  kodeIntern?: string;
  markis?: "TIDAK" | "YA";
  namaBarang?: string;
  beratAsli?: number;
  berat?: number;
  kadarCetak?: string;
  attributeName?: string;
  beratAtribut?: number;
  hargaAtribut?: number;
  beratPlastik?: number;
  size?: string;
  kategoriRel?: any;
  jenisRel?: any;
  kodeBakiRel?: any;
  createdAt?: string;
  updatedAt?: string;
};
