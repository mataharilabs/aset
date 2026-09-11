import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { listOffices, type SsoOffice } from "@/lib/sso-client";

/**
 * Sinkronkan Location lokal dari master Office di SSO.
 * Location di ASET adalah cermin (mirror) read-only: sumber tunggal ada di SSO,
 * sehingga relasi asset.locationId tetap valid tanpa mengizinkan tambah/hapus
 * di sisi ASET.
 */
export async function syncOfficesFromSSO(companyId: string, ssoCompanyId?: string) {
  const offices = await listOffices({ companyId: ssoCompanyId });
  for (const o of offices) {
    await upsertLocationMirror(companyId, o);
  }
}

async function upsertLocationMirror(companyId: string, o: SsoOffice) {
  const address = [o.address, o.city, o.province, o.country]
    .filter(Boolean)
    .join(", ") || null;

  const existing =
    (await prisma.location.findFirst({ where: { ssoOfficeId: o.id, companyId } })) ??
    (await prisma.location.findFirst({ where: { name: o.name, companyId } }));

  if (existing) {
    await prisma.location.update({
      where: { id: existing.id },
      data: { ssoOfficeId: o.id, name: o.name, address },
    });
    return existing.id;
  }

  try {
    const created = await prisma.location.create({
      data: { name: o.name, address, ssoOfficeId: o.id, companyId },
    });
    return created.id;
  } catch (e) {
    // Nama bentrok (unique name+company) → beri pembeda kota
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const created = await prisma.location.create({
        data: {
          name: o.city ? `${o.name} (${o.city})` : `${o.name} (${o.id.slice(0, 6)})`,
          address,
          ssoOfficeId: o.id,
          companyId,
        },
      });
      return created.id;
    }
    throw e;
  }
}
