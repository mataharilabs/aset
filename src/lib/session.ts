import { auth } from "@/auth";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER";
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

/** Ambil user dari session, atau null jika belum login. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

/** Wajib login. Throw AuthError(401) jika tidak. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Tidak terautentikasi", 401);
  return user;
}

/** Wajib login dengan salah satu role. Throw AuthError(403) jika role tidak cocok. */
export async function requireRole(
  roles: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("Akses ditolak", 403);
  }
  return user;
}

export function isManagerUp(role: SessionUser["role"]): boolean {
  return role === "SUPER_ADMIN" || role === "ASSET_MANAGER";
}
