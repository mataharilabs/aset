import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { categorySchema } from "@/lib/validations/master";

export async function GET() {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const categories = await prisma.category.findMany({
      where: { companyId: user.companyId },
      include: {
        parent: { select: { name: true } },
        _count: { select: { assets: true } },
      },
      orderBy: { name: "asc" },
    });
    return ok(categories);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const body = await req.json();
    const data = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        assetType: data.assetType ?? null,
        parentId: data.parentId || null,
        companyId: user.companyId,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
      newValues: category,
    });

    return ok(category, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
