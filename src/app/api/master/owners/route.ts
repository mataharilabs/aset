import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { listAppUsers, createAppUser, type AppUser } from "@/lib/sso-client";

/**
 * Sinkronkan Owner/PIC lokal dari user SSO ber-role ASET:ASSET_HANDLER.
 * Owner lokal = cermin (mirror) agar relasi asset.ownerId tetap valid.
 */
async function syncOwnersFromSSO(companyId: string, ssoCompanyId?: string) {
  const handlers = await listAppUsers({
    role: "ASSET_HANDLER",
    companyId: ssoCompanyId,
  });
  for (const h of handlers) {
    await upsertOwnerMirror(companyId, h);
  }
}

async function upsertOwnerMirror(companyId: string, h: AppUser) {
  const existing =
    (await prisma.owner.findUnique({ where: { ssoUserId: h.id } })) ??
    (h.email
      ? await prisma.owner.findFirst({
          where: { email: h.email, companyId },
        })
      : null);

  if (existing) {
    await prisma.owner.update({
      where: { id: existing.id },
      data: { ssoUserId: h.id, name: h.name ?? existing.name, email: h.email },
    });
    return existing.id;
  }
  try {
    const created = await prisma.owner.create({
      data: {
        name: h.name ?? h.email,
        email: h.email,
        ssoUserId: h.id,
        companyId,
      },
    });
    return created.id;
  } catch (e) {
    // Nama bentrok (unique name+company) → beri pembeda email
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const created = await prisma.owner.create({
        data: {
          name: `${h.name ?? h.email} (${h.email})`,
          email: h.email,
          ssoUserId: h.id,
          companyId,
        },
      });
      return created.id;
    }
    throw e;
  }
}

export async function GET() {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    await syncOwnersFromSSO(user.companyId, user.ssoCompanyId);
    const owners = await prisma.owner.findMany({
      where: { companyId: user.companyId },
      include: { _count: { select: { assets: true } } },
      orderBy: { name: "asc" },
    });
    return ok(owners);
  } catch (e) {
    return handleApiError(e);
  }
}

const createSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
    const data = createSchema.parse(await req.json());

    if (!user.ssoCompanyId) {
      return ok({ error: "SSO belum aktif untuk membuat Owner/PIC" }, 400);
    }

    // Buat user SSO ber-role ASSET_HANDLER
    const ssoUser = await createAppUser({
      name: data.name,
      email: data.email,
      password: data.password,
      companyId: user.ssoCompanyId,
      role: "ASSET_HANDLER",
    });

    // Cermin ke Owner lokal
    const ownerId = await upsertOwnerMirror(user.companyId, ssoUser);

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "CREATE",
      entityType: "Owner",
      entityId: ownerId,
      newValues: { name: data.name, email: data.email, role: "ASSET_HANDLER" },
    });

    return ok({ id: ownerId }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
