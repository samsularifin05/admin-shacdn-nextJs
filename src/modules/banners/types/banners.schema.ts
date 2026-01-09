import { z } from "zod";

export const bannerSchema = z.object({
  name: z.string().min(1, 'Required').transform(v => v?.toUpperCase()),
  image: z.string(),
  link: z.string().optional().transform(v => v?.toLowerCase()),
  sequence: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional().transform(v => v?.toLowerCase()),
});

export type BannerFormData = z.infer<typeof bannerSchema>;

export type Banner = {
  id: number;
  name: string;
  image: string;
  link?: string;
  sequence?: number;
  isActive?: boolean;
  description?: string;

  createdAt?: string;
  updatedAt?: string;
};
