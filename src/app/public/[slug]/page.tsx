import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicAssetView } from "@/components/public/PublicAssetView";

export const dynamic = "force-dynamic";

export default async function PublicAssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: decodeURIComponent(slug) },
    select: { id: true, name: true, email: true, phone: true, address: true },
  });
  if (!company) notFound();

  const rows = await prisma.asset.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      systemCode: true,
      name: true,
      assetType: true,
      status: true,
      quantity: true,
      quantityUnit: true,
      currentValue: true,
      purchaseDate: true,
      category: { select: { name: true } },
      owner: { select: { name: true } },
      location: { select: { name: true } },
    },
  });

  // Serialize (Decimal/Date → primitif)
  const assets = rows.map((a) => ({
    id: a.id,
    systemCode: a.systemCode,
    name: a.name,
    assetType: a.assetType,
    status: a.status,
    quantity: a.quantity ?? 1,
    quantityUnit: a.quantityUnit,
    currentValue: a.currentValue ? Number(a.currentValue) : 0,
    purchaseDate: a.purchaseDate ? a.purchaseDate.toISOString() : null,
    category: a.category?.name ?? null,
    owner: a.owner?.name ?? null,
    location: a.location?.name ?? null,
  }));

  return <PublicAssetView company={company} assets={assets} />;
}
