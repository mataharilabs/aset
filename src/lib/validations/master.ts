import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const locationSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  address: z.string().optional().nullable(),
});

export const brandSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
});

export const ownerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type OwnerInput = z.infer<typeof ownerSchema>;
