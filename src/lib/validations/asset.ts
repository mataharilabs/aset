import { z } from "zod";

const optionalString = z.string().optional().nullable();
const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isNaN(n) ? null : n;
  });

export const assetSchema = z.object({
  name: z.string().min(1, "Nama aset wajib diisi"),
  systemCode: optionalString, // kode aset (editable oleh manager+ saat edit)
  description: optionalString,
  assetType: z.enum(["PHYSICAL", "DIGITAL"]).default("PHYSICAL"),
  status: z
    .enum([
      "ACTIVE",
      "INACTIVE",
      "IN_MAINTENANCE",
      "DISPOSED",
      "TRANSFERRED",
      "LOST",
    ])
    .default("ACTIVE"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),

  serialNumber: optionalString,
  productionCode: optionalString,
  brandId: optionalString,
  model: optionalString,
  color: optionalString,
  condition: z
    .enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"])
    .default("GOOD"),

  ownerId: optionalString,
  locationId: optionalString,
  assignedToId: optionalString,

  purchaseDate: optionalString,
  purchasePrice: optionalNumber,
  currentValue: optionalNumber,
  usefulLifeYears: optionalNumber,
  salvageValue: optionalNumber,
  depreciationMethod: z
    .enum(["STRAIGHT_LINE", "DECLINING_BALANCE", "DOUBLE_DECLINING"])
    .default("STRAIGHT_LINE"),

  // Digital
  domain: optionalString,
  expiryDate: optionalString,
  licenseKey: optionalString,

  notes: optionalString,
  tags: z.array(z.string()).optional().default([]),
});

export type AssetInput = z.infer<typeof assetSchema>;
export type AssetFormInput = z.input<typeof assetSchema>;
export type AssetFormOutput = z.output<typeof assetSchema>;
