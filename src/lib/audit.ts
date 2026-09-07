import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type AuditInput = {
  companyId: string;
  userId: string;
  action: string; // CREATE, UPDATE, DELETE, SCAN, APPROVE, REJECT, LOGIN
  entityType: string; // Asset, Transaction, Maintenance, Category, ...
  entityId: string;
  assetId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/** Catat aktivitas ke audit log. Tidak melempar error agar tidak mengganggu alur utama. */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        assetId: input.assetId ?? null,
        oldValues: (input.oldValues ?? undefined) as Prisma.InputJsonValue,
        newValues: (input.newValues ?? undefined) as Prisma.InputJsonValue,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error("[AUDIT_LOG_FAILED]", err);
  }
}
