import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]),
});

export type UserFormData = z.infer<typeof userSchema>;

export type User = {
  id: number;
  name?: string | null;
  email: string;
  password?: string;
  role: string;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
};
