import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type Role = "SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  companyId: string;
  companyName: string;
};

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

const ROLES: Role[] = ["SUPER_ADMIN", "ASSET_MANAGER", "ASSET_HANDLER"];
const ssoEnabled = () => process.env.SSO_ENABLED === "true";

type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: Role;
  companyId?: string;
  companyName?: string;
  apps?: Record<string, string>;
};

async function getRawUser(): Promise<RawUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as RawUser;
}

/** Apakah ada sesi login (mentah), tanpa memandang akses ASET. */
export async function isAuthenticated(): Promise<boolean> {
  return (await getRawUser()) !== null;
}

/**
 * Mode SSO: identitas dari SSO, tetapi user & company direferensikan LOKAL.
 * Cocokkan berdasarkan email (agar user ASET lama tetap terpakai & FK aman).
 * Return null bila user tidak punya akses ke aplikasi ASET.
 */
export async function ensureLocalUser(claims: {
  email?: string | null;
  name?: string | null;
  appRole?: string;
}): Promise<SessionUser | null> {
  const role = (claims.appRole && ROLES.includes(claims.appRole as Role)
    ? (claims.appRole as Role)
    : null);
  if (!role || !claims.email) return null; // tanpa akses ASET

  const existing = await prisma.user.findUnique({
    where: { email: claims.email },
    include: { company: { select: { name: true } } },
  });

  if (existing) {
    if (existing.role !== role) {
      await prisma.user.update({ where: { id: existing.id }, data: { role } });
    }
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role,
      companyId: existing.companyId,
      companyName: existing.company.name,
    };
  }

  // Buat mirror user baru di company default ASET
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: "AsiaCommerce", slug: "asiacommerce" },
    });
  }
  const created = await prisma.user.create({
    data: {
      email: claims.email,
      name: claims.name ?? claims.email,
      password: "", // auth ada di SSO
      role,
      companyId: company.id,
    },
    include: { company: { select: { name: true } } },
  });
  return {
    id: created.id,
    name: created.name,
    email: created.email,
    role,
    companyId: created.companyId,
    companyName: created.company.name,
  };
}

/** Ambil user efektif, atau null (belum login ATAU tanpa akses ASET di mode SSO). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const raw = await getRawUser();
  if (!raw) return null;
  if (ssoEnabled()) {
    return ensureLocalUser({
      email: raw.email,
      name: raw.name,
      appRole: raw.apps?.["ASET"],
    });
  }
  return raw as SessionUser;
}

/** Wajib login + punya akses ASET. 401 jika belum login, 403 jika tanpa akses. */
export async function requireUser(): Promise<SessionUser> {
  const raw = await getRawUser();
  if (!raw) throw new AuthError("Tidak terautentikasi", 401);
  if (ssoEnabled()) {
    const local = await ensureLocalUser({
      email: raw.email,
      name: raw.name,
      appRole: raw.apps?.["ASET"],
    });
    if (!local) {
      throw new AuthError("Anda tidak memiliki akses ke aplikasi ASET", 403);
    }
    return local;
  }
  return raw as SessionUser;
}

/** Wajib salah satu role. Throw AuthError(403) jika tidak cocok. */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("Akses ditolak", 403);
  }
  return user;
}

export function isManagerUp(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "ASSET_MANAGER";
}
