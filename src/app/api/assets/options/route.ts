import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";
import { syncOfficesFromSSO } from "@/lib/office-sync";

export async function GET() {
  try {
    const user = await requireUser();
    const companyId = user.companyId;
    await syncOfficesFromSSO(companyId, user.ssoCompanyId);
    const [categories, brands, locations, owners] = await Promise.all([
      prisma.category.findMany({
        where: { companyId },
        select: { id: true, name: true, assetType: true },
        orderBy: { name: "asc" },
      }),
      prisma.brand.findMany({
        where: { companyId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.location.findMany({
        where: { companyId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.owner.findMany({
        where: { companyId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return ok({ categories, brands, locations, owners });
  } catch (e) {
    return handleApiError(e);
  }
}
