import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { assetSchema } from "@/lib/validations/asset";
import { generateSystemCode } from "@/lib/services/asset-code";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));
    const search = sp.get("search")?.trim();
    const status = sp.get("status") || undefined;
    const categoryId = sp.get("categoryId") || undefined;
    const assetType = sp.get("assetType") || undefined;

    const where: Prisma.AssetWhereInput = {
      companyId: user.companyId,
      ...(status ? { status: status as Prisma.AssetWhereInput["status"] } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(assetType
        ? { assetType: assetType as Prisma.AssetWhereInput["assetType"] }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { systemCode: { contains: search, mode: "insensitive" } },
              { serialNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          location: { select: { name: true } },
          owner: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ]);

    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const body = await req.json();
    const data = assetSchema.parse(body);

    const systemCode = await generateSystemCode(user.companyId);

    const asset = await prisma.asset.create({
      data: {
        systemCode,
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
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ?? null,
        currentValue: data.currentValue ?? data.purchasePrice ?? null,
        usefulLifeYears: data.usefulLifeYears ?? null,
        salvageValue: data.salvageValue ?? null,
        depreciationMethod: data.depreciationMethod,
        domain: data.domain ?? null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        licenseKey: data.licenseKey ?? null,
        notes: data.notes ?? null,
        tags: data.tags ?? [],
        companyId: user.companyId,
        createdById: user.id,
        approvalStatus: "APPROVED",
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "CREATE",
      entityType: "Asset",
      entityId: asset.id,
      assetId: asset.id,
      newValues: { systemCode, name: asset.name },
    });

    return ok(asset, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
