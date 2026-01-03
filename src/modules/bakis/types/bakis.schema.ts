import { z } from "zod";

export const bakiSchema = z.object({
  kodeGudang: z.string(),
  kodeBaki: z.string(),
  namaBaki: z.string(),
  beratBaki: z.coerce.number(),
  beratBandrol: z.coerce.number(),
});

export type BakiFormData = z.infer<typeof bakiSchema>;

export type Baki = {
  id: number;
  kodeGudang: string;
  kodeBaki: string;
  namaBaki: string;
  beratBaki: number;
  beratBandrol: number;

  createdAt?: string;
  updatedAt?: string;
};
