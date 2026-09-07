import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { notifyUser } from "@/lib/services/notification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action: "APPROVE" | "REJECT" =
      body.action === "REJECT" ? "REJECT" : "APPROVE";
    const notes: string | null = body.notes ?? null;

    const txn = await prisma.assetTransaction.findFirst({
      where: { id, companyId: user.companyId },
      include: { asset: true },
    });
    if (!txn) return handleApiError({ name: "NotFound" });
    if (txn.status !== "PENDING") {
      return ok({ error: "Transaksi sudah diproses" }, 409);
    }

    if (action === "REJECT") {
      await prisma.assetTransaction.update({
        where: { id },
        data: { status: "REJECTED", notes },
      });
    } else {
      // Terapkan efek transaksi
      await prisma.$transaction(async (tx) => {
        await tx.assetTransaction.update({
          where: { id },
          data: { status: "COMPLETED", notes },
        });

        if (txn.type === "MUTATION" || txn.type === "HANDOVER") {
          await tx.asset.update({
            where: { id: txn.assetId },
            data: {
              locationId: txn.toLocationId ?? txn.asset.locationId,
              ownerId: txn.toOwnerId ?? txn.asset.ownerId,
              status: "ACTIVE",
            },
          });
        } else if (txn.type === "DISPOSAL") {
          await tx.asset.update({
            where: { id: txn.assetId },
            data: { status: "DISPOSED" },
          });
        } else if (txn.type === "REVERSE_DISPOSAL") {
          await tx.asset.update({
            where: { id: txn.assetId },
            data: { status: "ACTIVE" },
          });
        }
      });
    }

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: action === "APPROVE" ? "APPROVE" : "REJECT",
      entityType: "Transaction",
      entityId: id,
      assetId: txn.assetId,
    });

    await notifyUser(txn.requestedById, {
      type: "APPROVAL_RESULT",
      title: `Transaksi ${action === "APPROVE" ? "disetujui" : "ditolak"}`,
      message: `${txn.transactionCode} telah ${
        action === "APPROVE" ? "disetujui" : "ditolak"
      }.`,
      link: `/transactions/${id}`,
      entityType: "Transaction",
      entityId: id,
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
