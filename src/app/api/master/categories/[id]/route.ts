import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { categorySchema } from "@/lib/validations/master";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const body = await req.json();
    const data = categorySchema.parse(body);

    // Pastikan milik company yang sama
    const existing = await prisma.category.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
        parentId: data.parentId || null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "UPDATE",
      entityType: "Category",
      entityId: id,
      oldValues: existing,
      newValues: updated,
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

    const existing = await prisma.category.findFirst({
      where: { id, companyId: user.companyId },
      include: { _count: { select: { assets: true } } },
    });
    if (!existing) return handleApiError({ name: "NotFound" });
    if (existing._count.assets > 0) {
      return ok(
        { error: "Kategori masih dipakai oleh aset, tidak bisa dihapus" },
        409
      );
    }

    await prisma.category.delete({ where: { id } });
    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "DELETE",
      entityType: "Category",
      entityId: id,
      oldValues: existing,
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
