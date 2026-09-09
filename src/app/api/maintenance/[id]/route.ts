import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { maintenanceSchema } from "@/lib/validations/maintenance";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const data = maintenanceSchema.parse(await req.json());

    const existing = await prisma.maintenance.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        assetId: data.assetId,
        title: data.title,
        type: data.type,
        frequency: data.frequency ?? null,
        scheduledDate: new Date(data.scheduledDate),
        description: data.description ?? null,
        vendor: data.vendor ?? null,
        cost: data.cost ?? null,
        reminderDays: data.reminderDays,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "UPDATE",
      entityType: "Maintenance",
      entityId: id,
      assetId: data.assetId,
    });
    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const existing = await prisma.maintenance.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    // Hapus log dulu (FK) lalu maintenance
    await prisma.maintenanceLog.deleteMany({ where: { maintenanceId: id } });
    await prisma.maintenance.delete({ where: { id } });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "DELETE",
      entityType: "Maintenance",
      entityId: id,
      assetId: existing.assetId,
    });
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
