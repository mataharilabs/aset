import { z } from "zod";

export const financialSchema = z.object({
  assetId: z.string().min(1, "Aset wajib dipilih"),
  type: z.enum(["INCOME", "EXPENSE", "TAX", "INSURANCE"]),
  amount: z
    .union([z.number(), z.string()])
    .transform((v) => {
      const n = typeof v === "string" ? Number(v) : v;
      return Number.isNaN(n) ? 0 : n;
    })
    .refine((n) => n > 0, "Jumlah harus lebih dari 0"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.string().optional().nullable(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  vendor: z.string().optional().nullable(),
  invoiceNumber: z.string().optional().nullable(),
});

export type FinancialInput = z.infer<typeof financialSchema>;
