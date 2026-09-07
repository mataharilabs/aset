import { z } from "zod";

export const transactionSchema = z
  .object({
    type: z.enum(["MUTATION", "DISPOSAL", "REVERSE_DISPOSAL", "HANDOVER"]),
    assetId: z.string().min(1, "Aset wajib dipilih"),
    toLocationId: z.string().optional().nullable(),
    toOwnerId: z.string().optional().nullable(),
    disposalReason: z.string().optional().nullable(),
    disposalValue: z
      .union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform((v) => {
        if (v === null || v === undefined || v === "") return null;
        const n = typeof v === "string" ? Number(v) : v;
        return Number.isNaN(n) ? null : n;
      }),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (d) =>
      d.type !== "MUTATION" ||
      Boolean(d.toLocationId) ||
      Boolean(d.toOwnerId),
    { message: "Mutasi butuh lokasi atau owner tujuan", path: ["toLocationId"] }
  )
  .refine((d) => d.type !== "DISPOSAL" || Boolean(d.disposalReason), {
    message: "Alasan penghapusan wajib diisi",
    path: ["disposalReason"],
  });

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFormInput = z.input<typeof transactionSchema>;
export type TransactionFormOutput = z.output<typeof transactionSchema>;
