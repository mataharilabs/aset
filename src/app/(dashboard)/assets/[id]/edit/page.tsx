import { redirect, notFound } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssetForm } from "@/components/assets/AssetForm";
import type { AssetInput } from "@/lib/validations/asset";

function toDateInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/assets");
  const { id } = await params;

  const asset = await prisma.asset.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!asset) notFound();

  const initial: Partial<AssetInput> = {
    name: asset.name,
    description: asset.description,
    assetType: asset.assetType,
    status: asset.status,
    categoryId: asset.categoryId,
    serialNumber: asset.serialNumber,
    productionCode: asset.productionCode,
    brandId: asset.brandId,
    model: asset.model,
    color: asset.color,
    condition: asset.condition,
    ownerId: asset.ownerId,
    locationId: asset.locationId,
    assignedToId: asset.assignedToId,
    purchaseDate: toDateInput(asset.purchaseDate),
    purchasePrice: asset.purchasePrice
      ? Number(asset.purchasePrice)
      : null,
    currentValue: asset.currentValue ? Number(asset.currentValue) : null,
    usefulLifeYears: asset.usefulLifeYears,
    salvageValue: asset.salvageValue ? Number(asset.salvageValue) : null,
    depreciationMethod: asset.depreciationMethod,
    domain: asset.domain,
    expiryDate: toDateInput(asset.expiryDate),
    licenseKey: asset.licenseKey,
    notes: asset.notes,
    tags: asset.tags,
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Edit Aset"
        description={`${asset.systemCode} · ${asset.name}`}
      />
      <AssetForm assetId={asset.id} initial={initial} />
    </div>
  );
}
