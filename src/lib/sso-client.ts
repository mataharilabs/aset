// Klien service ke SSO (Identity Provider) memakai SERVICE_API_KEY.
// Dipakai untuk Owner/PIC (user SSO ber-role ASET) & hitung pengguna.

const SSO_URL = process.env.SSO_URL ?? "";
const KEY = process.env.SERVICE_API_KEY ?? "";
const APP = "ASET";

export type AppUser = { id: string; name: string | null; email: string; role?: string };

export type SsoOffice = {
  id: string;
  name: string;
  country: string | null;
  province: string | null;
  city: string | null;
  address: string | null;
  isPrimary: boolean;
};

function ready(): boolean {
  return Boolean(SSO_URL && KEY);
}

async function ssoFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${SSO_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

/** Daftar user SSO dgn role tertentu pada aplikasi ASET (mis. ASSET_HANDLER). */
export async function listAppUsers(opts: {
  role?: string;
  companyId?: string;
}): Promise<AppUser[]> {
  if (!ready()) return [];
  const qs = new URLSearchParams({ applicationKey: APP });
  if (opts.role) qs.set("role", opts.role);
  if (opts.companyId) qs.set("companyId", opts.companyId);
  const res = await ssoFetch(`/api/service/app-users?${qs}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.users ?? [];
}

/** Jumlah user SSO yang punya akses ASET (opsional per company). */
export async function countAppUsers(opts: {
  companyId?: string;
}): Promise<number | null> {
  if (!ready()) return null;
  const qs = new URLSearchParams({ applicationKey: APP });
  if (opts.companyId) qs.set("companyId", opts.companyId);
  const res = await ssoFetch(`/api/service/app-users/count?${qs}`);
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.count === "number" ? data.count : null;
}

/** Buat/pastikan user SSO + assign role ASET (default ASSET_HANDLER). */
export async function createAppUser(input: {
  name: string;
  email: string;
  password: string;
  companyId: string;
  role?: string;
}): Promise<AppUser> {
  if (!ready()) throw new Error("SSO belum dikonfigurasi (SSO_URL/SERVICE_API_KEY)");
  const res = await ssoFetch(`/api/service/app-users`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
      companyId: input.companyId,
      applicationKey: APP,
      role: input.role ?? "ASSET_HANDLER",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? "Gagal membuat user di SSO");
  }
  return data as AppUser;
}

/** Daftar kantor (Office) dari master SSO untuk company tertentu. */
export async function listOffices(opts: {
  companyId?: string;
}): Promise<SsoOffice[]> {
  if (!ready()) return [];
  const qs = new URLSearchParams();
  if (opts.companyId) qs.set("companyId", opts.companyId);
  const res = await ssoFetch(`/api/service/offices?${qs}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.offices ?? [];
}

/** Cabut akses ASET dari user SSO. */
export async function revokeAppUserRole(userId: string): Promise<void> {
  if (!ready()) return;
  await ssoFetch(
    `/api/service/app-users/${userId}/role?applicationKey=${APP}`,
    { method: "DELETE" }
  );
}
