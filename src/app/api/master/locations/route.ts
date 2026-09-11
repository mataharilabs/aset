import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { syncOfficesFromSSO } from "@/lib/office-sync";

// Lokasi = cermin master Office di SSO. Read-only di sisi ASET.
export async function GET() {
  try {
    const user = await requireUser();
    await syncOfficesFromSSO(user.companyId, user.ssoCompanyId);
    const locations = await prisma.location.findMany({
      where: { companyId: user.companyId },
      include: { _count: { select: { assets: true } } },
      orderBy: { name: "asc" },
    });
    return ok(locations);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST() {
  return ok(
    { error: "Lokasi dikelola di SSO (Lokasi Kantor). Tidak bisa ditambah dari ASET." },
    403
  );
}
