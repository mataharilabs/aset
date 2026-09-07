import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/session";
import { buildCsv } from "@/lib/services/export";
import { handleApiError } from "@/lib/api";
import {
  ASSET_STATUS_LABELS,
  ASSET_TYPE_LABELS,
  CONDITION_LABELS,
} from "@/lib/constants";

export async function GET() {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const assets = await prisma.asset.findMany({
      where: { companyId: user.companyId },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        location: { select: { name: true } },
        owner: { select: { name: true } },
      },
      orderBy: { systemCode: "asc" },
    });

    const csv = buildCsv(
      [
        "Kode",
        "Nama",
        "Tipe",
        "Kategori",
        "Merk",
        "Lokasi",
        "Owner",
        "Kondisi",
        "Status",
        "Harga Beli",
        "Nilai Kini",
      ],
      assets.map((a) => [
        a.systemCode,
        a.name,
        ASSET_TYPE_LABELS[a.assetType] ?? a.assetType,
        a.category?.name ?? "",
        a.brand?.name ?? "",
        a.location?.name ?? "",
        a.owner?.name ?? "",
        CONDITION_LABELS[a.condition] ?? a.condition,
        ASSET_STATUS_LABELS[a.status] ?? a.status,
        a.purchasePrice?.toString() ?? "",
        a.currentValue?.toString() ?? "",
      ])
    );

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-aset-${Date.now()}.csv"`,
      },
    });
  } catch (e) {
    if (e instanceof AuthError) return handleApiError(e);
    return handleApiError(e);
  }
}
