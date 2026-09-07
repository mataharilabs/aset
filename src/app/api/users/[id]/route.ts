import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { updateUserSchema } from "@/lib/validations/user";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["SUPER_ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { id, companyId: admin.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    // Cegah admin menonaktifkan dirinya sendiri
    if (id === admin.id && data.isActive === false) {
      return ok({ error: "Tidak bisa menonaktifkan akun sendiri" }, 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.role ? { role: data.role } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await logAudit({
      companyId: admin.companyId,
      userId: admin.id,
      action: "UPDATE",
      entityType: "User",
      entityId: id,
      newValues: data,
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
