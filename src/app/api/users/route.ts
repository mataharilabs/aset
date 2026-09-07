import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { createUserSchema } from "@/lib/validations/user";

export async function GET() {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const users = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return ok(users);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(["SUPER_ADMIN"]);
    const body = await req.json();
    const data = createUserSchema.parse(body);

    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists) return ok({ error: "Email sudah terdaftar" }, 409);

    const hashed = await bcrypt.hash(data.password, 10);
    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: data.role,
        companyId: admin.companyId,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await logAudit({
      companyId: admin.companyId,
      userId: admin.id,
      action: "CREATE",
      entityType: "User",
      entityId: created.id,
      newValues: { email: created.email, role: created.role },
    });

    return ok(created, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
