import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";

// Batalkan pengajuan transaksi (SUPER_ADMIN & ASSET_MANAGER), status PENDING → CANCELLED.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const txn = await prisma.assetTransaction.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!txn) return handleApiError({ name: "NotFound" });
    if (txn.status !== "PENDING") {
      return ok({ error: "Hanya transaksi PENDING yang bisa dibatalkan" }, 409);
    }

    await prisma.assetTransaction.update({
      where: { id },
      data: { status: "CANCELLED", notes: body.notes ?? txn.notes },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "CANCEL",
      entityType: "Transaction",
      entityId: id,
      assetId: txn.assetId,
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
