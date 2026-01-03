import { z } from "zod";

export const bakiSchema = z.object({
  kodeGudang: z.string().optional().transform(v => v?.toUpperCase()),
  kodeBaki: z.string().min(1, 'Required').transform(v => v?.toUpperCase()),
  namaBaki: z.string().optional().transform(v => v?.toUpperCase()),
  beratBaki: z.coerce.number().optional(),
  beratBandrol: z.coerce.number().optional(),
});

export type BakiFormData = z.infer<typeof bakiSchema>;

export type Baki = {
  id: number;
  kodeGudang?: string;
  kodeBaki: string;
  namaBaki?: string;
  beratBaki?: number;
  beratBandrol?: number;

  createdAt?: string;
  updatedAt?: string;
};
