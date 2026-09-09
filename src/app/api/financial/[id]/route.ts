import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { financialSchema } from "@/lib/validations/financial";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const data = financialSchema.parse(await req.json());

    const existing = await prisma.financial.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    const updated = await prisma.financial.update({
      where: { id },
      data: {
        assetId: data.assetId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category ?? null,
        date: new Date(data.date),
        vendor: data.vendor ?? null,
        invoiceNumber: data.invoiceNumber ?? null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "UPDATE",
      entityType: "Financial",
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
    const existing = await prisma.financial.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    await prisma.financial.delete({ where: { id } });
    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "DELETE",
      entityType: "Financial",
      entityId: id,
      assetId: existing.assetId,
    });
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
