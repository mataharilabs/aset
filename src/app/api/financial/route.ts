import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { financialSchema } from "@/lib/validations/financial";

export async function GET() {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const [items, incomeAgg, expenseAgg] = await Promise.all([
      prisma.financial.findMany({
        where: { companyId: user.companyId },
        include: { asset: { select: { name: true, systemCode: true } } },
        orderBy: { date: "desc" },
        take: 100,
      }),
      prisma.financial.aggregate({
        where: { companyId: user.companyId, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.financial.aggregate({
        where: {
          companyId: user.companyId,
          type: { in: ["EXPENSE", "TAX", "INSURANCE"] },
        },
        _sum: { amount: true },
      }),
    ]);
    return ok({
      items,
      totalIncome: incomeAgg._sum.amount?.toString() ?? "0",
      totalExpense: expenseAgg._sum.amount?.toString() ?? "0",
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const body = await req.json();
    const data = financialSchema.parse(body);

    const asset = await prisma.asset.findFirst({
      where: { id: data.assetId, companyId: user.companyId },
    });
    if (!asset) return handleApiError({ name: "NotFound" });

    const f = await prisma.financial.create({
      data: {
        assetId: data.assetId,
        companyId: user.companyId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category ?? null,
        date: new Date(data.date),
        vendor: data.vendor ?? null,
        invoiceNumber: data.invoiceNumber ?? null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "CREATE",
      entityType: "Financial",
      entityId: f.id,
      assetId: asset.id,
      newValues: { type: data.type, amount: data.amount },
    });

    return ok(f, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
