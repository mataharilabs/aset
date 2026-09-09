import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

// Edit profil perusahaan (SUPER_ADMIN).
export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const data = schema.parse(await req.json());

    const updated = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "UPDATE",
      entityType: "Company",
      entityId: user.companyId,
      newValues: { name: data.name },
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
