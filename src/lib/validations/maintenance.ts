import { z } from "zod";

export const maintenanceSchema = z.object({
  assetId: z.string().min(1, "Aset wajib dipilih"),
  title: z.string().min(1, "Judul wajib diisi"),
  type: z.enum(["SCHEDULED", "CORRECTIVE", "PREVENTIVE", "ONE_TIME"]),
  frequency: z
    .enum([
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "QUARTERLY",
      "SEMI_ANNUAL",
      "ANNUAL",
    ])
    .optional()
    .nullable(),
  scheduledDate: z.string().min(1, "Tanggal wajib diisi"),
  description: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  cost: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "string" ? Number(v) : v;
      return Number.isNaN(n) ? null : n;
    }),
  reminderDays: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return 7;
      const n = typeof v === "string" ? Number(v) : v;
      return Number.isNaN(n) ? 7 : n;
    }),
});

export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type MaintenanceFormInput = z.input<typeof maintenanceSchema>;
export type MaintenanceFormOutput = z.output<typeof maintenanceSchema>;
