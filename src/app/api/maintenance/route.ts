import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole, handlerOwnerId } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { maintenanceSchema } from "@/lib/validations/maintenance";

export async function GET() {
  try {
    const user = await requireUser();
    // ASSET_HANDLER hanya melihat perawatan aset yang ia PIC/Owner-nya
    const assetFilter =
      user.role === "ASSET_HANDLER"
        ? { asset: { ownerId: (await handlerOwnerId(user)) ?? "__none__" } }
        : {};
    const items = await prisma.maintenance.findMany({
      where: { companyId: user.companyId, ...assetFilter },
      include: { asset: { select: { name: true, systemCode: true } } },
      orderBy: { scheduledDate: "asc" },
      take: 100,
    });
    return ok(items);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const body = await req.json();
    const data = maintenanceSchema.parse(body);

    const asset = await prisma.asset.findFirst({
      where: { id: data.assetId, companyId: user.companyId },
    });
    if (!asset) return handleApiError({ name: "NotFound" });

    const m = await prisma.maintenance.create({
      data: {
        assetId: data.assetId,
        companyId: user.companyId,
        title: data.title,
        type: data.type,
        frequency: data.frequency ?? null,
        scheduledDate: new Date(data.scheduledDate),
        description: data.description ?? null,
        vendor: data.vendor ?? null,
        cost: data.cost ?? null,
        reminderDays: data.reminderDays,
        status: "SCHEDULED",
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "CREATE",
      entityType: "Maintenance",
      entityId: m.id,
      assetId: asset.id,
      newValues: { title: m.title },
    });

    return ok(m, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
