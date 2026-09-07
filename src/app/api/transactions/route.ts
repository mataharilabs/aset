import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { notifyRoles } from "@/lib/services/notification";
import { generateTransactionCode } from "@/lib/services/asset-code";
import { transactionSchema } from "@/lib/validations/transaction";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const where: Prisma.AssetTransactionWhereInput = {
      companyId: user.companyId,
      ...(status
        ? { status: status as Prisma.AssetTransactionWhereInput["status"] }
        : {}),
    };
    const items = await prisma.assetTransaction.findMany({
      where,
      include: {
        asset: { select: { name: true, systemCode: true } },
        requestedBy: { select: { name: true } },
        targetLocation: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return ok(items);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = transactionSchema.parse(body);

    const asset = await prisma.asset.findFirst({
      where: { id: data.assetId, companyId: user.companyId },
    });
    if (!asset) return handleApiError({ name: "NotFound" });

    const transactionCode = await generateTransactionCode(user.companyId);

    const txn = await prisma.assetTransaction.create({
      data: {
        transactionCode,
        type: data.type,
        status: "PENDING",
        assetId: data.assetId,
        requestedById: user.id,
        companyId: user.companyId,
        fromLocationId: asset.locationId,
        toLocationId: data.toLocationId || null,
        fromOwnerId: asset.ownerId,
        toOwnerId: data.toOwnerId || null,
        disposalReason: data.disposalReason ?? null,
        disposalValue: data.disposalValue ?? null,
        notes: data.notes ?? null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "CREATE",
      entityType: "Transaction",
      entityId: txn.id,
      assetId: asset.id,
      newValues: { transactionCode, type: data.type },
    });

    await notifyRoles(user.companyId, ["SUPER_ADMIN", "ASSET_MANAGER"], {
      type: "APPROVAL_REQUIRED",
      title: "Persetujuan transaksi diperlukan",
      message: `${transactionCode} (${data.type}) untuk aset ${asset.name} menunggu persetujuan.`,
      link: `/transactions/${txn.id}`,
      entityType: "Transaction",
      entityId: txn.id,
    });

    return ok(txn, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
