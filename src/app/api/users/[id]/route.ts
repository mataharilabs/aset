import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { updateUserSchema, profileToPrisma } from "@/lib/validations/user";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["SUPER_ADMIN"]);
    const { id } = await params;
    const user = await prisma.user.findFirst({
      where: { id, companyId: admin.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        reportsToId: true,
        profile: true,
      },
    });
    if (!user) return handleApiError({ name: "NotFound" });
    return ok(user);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["SUPER_ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { id, companyId: admin.companyId },
    });
    if (!existing) return handleApiError({ name: "NotFound" });

    // Cegah admin menonaktifkan / menurunkan role dirinya sendiri
    if (id === admin.id && data.isActive === false) {
      return ok({ error: "Tidak bisa menonaktifkan akun sendiri" }, 400);
    }

    // Cek email unik jika diubah
    if (data.email && data.email !== existing.email) {
      const dup = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (dup) return ok({ error: "Email sudah dipakai user lain" }, 409);
    }

    const profileData = profileToPrisma(data.profile);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.role ? { role: data.role } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.reportsToId !== undefined
          ? { reportsToId: data.reportsToId || null }
          : {}),
        ...(data.password
          ? { password: await bcrypt.hash(data.password, 10) }
          : {}),
        ...(data.profile
          ? {
              profile: {
                upsert: {
                  create: profileData,
                  update: profileData,
                },
              },
            }
          : {}),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await logAudit({
      companyId: admin.companyId,
      userId: admin.id,
      action: "UPDATE",
      entityType: "User",
      entityId: id,
      newValues: {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
        passwordReset: Boolean(data.password),
      },
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
