import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { assetSchema } from "@/lib/validations/asset";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const asset = await prisma.asset.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        category: true,
        brand: true,
        location: true,
        owner: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!asset) return handleApiError({ name: "NotFound" });
    return ok(asset);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const body = await req.json();
    const data = assetSchema.parse(body);

    const existing = await prisma.asset.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    // Cek kode unik bila diubah
    if (data.systemCode && data.systemCode !== existing.systemCode) {
      const dup = await prisma.asset.findUnique({
        where: { systemCode: data.systemCode },
        select: { id: true },
      });
      if (dup) return ok({ error: "Kode aset sudah dipakai" }, 409);
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(data.systemCode ? { systemCode: data.systemCode } : {}),
        name: data.name,
        description: data.description ?? null,
        assetType: data.assetType,
        status: data.status,
        categoryId: data.categoryId,
        serialNumber: data.serialNumber ?? null,
        productionCode: data.productionCode ?? null,
        brandId: data.brandId || null,
        model: data.model ?? null,
        color: data.color ?? null,
        condition: data.condition,
        ownerId: data.ownerId || null,
        locationId: data.locationId || null,
        assignedToId: data.assignedToId || null,
        quantity: data.quantity ?? 1,
        quantityUnit: data.quantityUnit ?? null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ?? null,
        currentValue: data.currentValue ?? null,
        usefulLifeYears: data.usefulLifeYears ?? null,
        salvageValue: data.salvageValue ?? null,
        depreciationMethod: data.depreciationMethod,
        domain: data.domain ?? null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        licenseKey: data.licenseKey ?? null,
        paymentStructure: data.paymentStructure ?? null,
        paymentFrequency: data.paymentFrequency ?? null,
        credentialUsername: data.credentialUsername ?? null,
        credentialPassword: data.credentialPassword ?? null,
        notes: data.notes ?? null,
        tags: data.tags ?? [],
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "UPDATE",
      entityType: "Asset",
      entityId: id,
      assetId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: updated.name, status: updated.status },
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
    const existing = await prisma.asset.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    await prisma.asset.delete({ where: { id } });
    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "DELETE",
      entityType: "Asset",
      entityId: id,
      assetId: id,
      oldValues: { name: existing.name, systemCode: existing.systemCode },
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
