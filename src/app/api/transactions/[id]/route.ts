import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";

// Hapus transaksi permanen (SUPER_ADMIN).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const { id } = await params;

    const txn = await prisma.assetTransaction.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!txn) return handleApiError({ name: "NotFound" });

    await prisma.assetTransaction.delete({ where: { id } });
    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "DELETE",
      entityType: "Transaction",
      entityId: id,
      assetId: txn.assetId,
      oldValues: { transactionCode: txn.transactionCode, type: txn.type },
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
