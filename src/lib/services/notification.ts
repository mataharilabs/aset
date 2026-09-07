import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

/** Kirim notifikasi ke semua user dengan role tertentu di company. */
export async function notifyRoles(
  companyId: string,
  roles: ("SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER")[],
  payload: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    entityType?: string;
    entityId?: string;
  }
) {
  const users = await prisma.user.findMany({
    where: { companyId, role: { in: roles }, isActive: true },
    select: { id: true },
  });
  if (users.length === 0) return;
  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
      entityType: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
    })),
  });
}

/** Kirim notifikasi ke satu user. */
export async function notifyUser(
  userId: string,
  payload: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    entityType?: string;
    entityId?: string;
  }
) {
  await prisma.notification.create({
    data: {
      userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
      entityType: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
    },
  });
}
