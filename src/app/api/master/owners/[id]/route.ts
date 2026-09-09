import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { revokeAppUserRole } from "@/lib/sso-client";

// Hapus Owner/PIC = cabut akses ASET dari user SSO + hapus mirror lokal.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;

    const owner = await prisma.owner.findFirst({
      where: { id, companyId: user.companyId },
      include: { _count: { select: { assets: true } } },
    });
    if (!owner) return handleApiError({ name: "NotFound" });
    if (owner._count.assets > 0) {
      return ok(
        { error: "Owner masih menjadi PIC aset, tidak bisa dihapus" },
        409
      );
    }

    if (owner.ssoUserId) {
      await revokeAppUserRole(owner.ssoUserId);
    }
    await prisma.owner.delete({ where: { id } });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "DELETE",
      entityType: "Owner",
      entityId: id,
      oldValues: { name: owner.name, email: owner.email },
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
