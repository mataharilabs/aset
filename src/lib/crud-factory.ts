import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { logAudit } from "@/lib/audit";

type ModelName = "location" | "brand" | "owner";

type Config = {
  model: ModelName;
  entityType: string;
  schema: z.ZodTypeAny;
  include?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc">;
};

// Delegate Prisma diakses secara dinamis; tipe dilonggarkan seperlunya.
function delegate(model: ModelName) {
  return prisma[model] as unknown as {
    findMany: (args: unknown) => Promise<unknown[]>;
    findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
    update: (args: unknown) => Promise<Record<string, unknown>>;
    delete: (args: unknown) => Promise<unknown>;
  };
}

export function makeListCreate(config: Config) {
  const GET = async () => {
    try {
      const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
      const rows = await delegate(config.model).findMany({
        where: { companyId: user.companyId },
        include: config.include,
        orderBy: config.orderBy ?? { name: "asc" },
      });
      return ok(rows);
    } catch (e) {
      return handleApiError(e);
    }
  };

  const POST = async (req: NextRequest) => {
    try {
      const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
      const body = await req.json();
      const data = config.schema.parse(body);
      const created = await delegate(config.model).create({
        data: { ...cleanEmpty(data), companyId: user.companyId },
      });
      await logAudit({
        companyId: user.companyId,
        userId: user.id,
        action: "CREATE",
        entityType: config.entityType,
        entityId: created.id as string,
        newValues: created,
      });
      return ok(created, 201);
    } catch (e) {
      return handleApiError(e);
    }
  };

  return { GET, POST };
}

export function makeUpdateDelete(config: Config) {
  const PUT = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
      const { id } = await params;
      const body = await req.json();
      const data = config.schema.parse(body);

      const existing = await delegate(config.model).findFirst({
        where: { id, companyId: user.companyId },
      });
      if (!existing) return handleApiError({ name: "NotFound" });

      const updated = await delegate(config.model).update({
        where: { id },
        data: cleanEmpty(data),
      });
      await logAudit({
        companyId: user.companyId,
        userId: user.id,
        action: "UPDATE",
        entityType: config.entityType,
        entityId: id,
        oldValues: existing,
        newValues: updated,
      });
      return ok(updated);
    } catch (e) {
      return handleApiError(e);
    }
  };

  const DELETE = async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const user = await requireRole(["SUPER_ADMIN", "ASSET_MANAGER"]);
      const { id } = await params;
      const existing = await delegate(config.model).findFirst({
        where: { id, companyId: user.companyId },
      });
      if (!existing) return handleApiError({ name: "NotFound" });

      await delegate(config.model).delete({ where: { id } });
      await logAudit({
        companyId: user.companyId,
        userId: user.id,
        action: "DELETE",
        entityType: config.entityType,
        entityId: id,
        oldValues: existing,
      });
      return ok({ success: true });
    } catch (e) {
      return handleApiError(e);
    }
  };

  return { PUT, DELETE };
}

// Ubah string kosong menjadi null agar rapi di DB
function cleanEmpty(data: unknown): Record<string, unknown> {
  const obj = data as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === "" ? null : v;
  }
  return out;
}
