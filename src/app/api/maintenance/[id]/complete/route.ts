import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const m = await prisma.maintenance.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!m) return handleApiError({ name: "NotFound" });

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedDate: new Date(),
        cost: body.cost != null && body.cost !== "" ? Number(body.cost) : m.cost,
        logs: {
          create: {
            userId: user.id,
            action: "COMPLETED",
            notes: body.notes ?? null,
            cost:
              body.cost != null && body.cost !== ""
                ? Number(body.cost)
                : null,
          },
        },
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "UPDATE",
      entityType: "Maintenance",
      entityId: id,
      assetId: m.assetId,
      newValues: { status: "COMPLETED" },
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
