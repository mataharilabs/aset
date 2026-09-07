import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { handleApiError, ok } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();
    const companyId = user.companyId;
    const [categories, brands, locations, owners, users] = await Promise.all([
      prisma.category.findMany({
        where: { companyId },
        select: { id: true, name: true },
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
      prisma.user.findMany({
        where: { companyId, isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return ok({ categories, brands, locations, owners, users });
  } catch (e) {
    return handleApiError(e);
  }
}
