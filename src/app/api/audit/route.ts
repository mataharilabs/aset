import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";

// Hapus seluruh audit log company (SUPER_ADMIN).
export async function DELETE() {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    await prisma.auditLog.deleteMany({ where: { companyId: user.companyId } });
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
