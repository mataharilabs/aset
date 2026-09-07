import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["SUPER_ADMIN", "ASSET_MANAGER", "ASSET_HANDLER"]),
});

export const updateUserSchema = z.object({
  role: z
    .enum(["SUPER_ADMIN", "ASSET_MANAGER", "ASSET_HANDLER"])
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
