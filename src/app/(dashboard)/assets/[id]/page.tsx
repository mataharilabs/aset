import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, QrCode, ArrowLeft, Box, Monitor } from "lucide-react";
import { requireUser, isManagerUp, handlerOwnerId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssetStatusBadge } from "@/components/assets/AssetStatusBadge";
import { DeleteAssetButton } from "@/components/assets/DeleteAssetButton";
import {
  ASSET_TYPE_LABELS,
  CONDITION_LABELS,
  DEPRECIATION_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-50 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">
        {value ?? "-"}
      </span>
    </div>
  );
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const asset = await prisma.asset.findFirst({
    where: { id, companyId: user.companyId },
    include: {
      category: true,
      brand: true,
      location: true,
      owner: true,
      createdBy: { select: { name: true } },
      maintenances: {
        orderBy: { scheduledDate: "desc" },
        take: 5,
        select: { id: true, title: true, scheduledDate: true, status: true },
      },
      financials: {
        orderBy: { date: "desc" },
        take: 5,
        select: { id: true, type: true, amount: true, description: true, date: true },
      },
    },
  });

  if (!asset) notFound();
  // ASSET_HANDLER hanya boleh melihat aset yang ia PIC/Owner-nya
  if (!isManagerUp(user.role)) {
    const ownerId = await handlerOwnerId(user);
    if (!ownerId || asset.ownerId !== ownerId) notFound();
  }
  const canEdit = isManagerUp(user.role);
  const isDigital = asset.assetType === "DIGITAL";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4">
        <Link
          href="/assets"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar aset
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isDigital ? (
              <Monitor className="h-5 w-5 text-slate-400" />
            ) : (
              <Box className="h-5 w-5 text-slate-400" />
            )}
            <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
            <AssetStatusBadge status={asset.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-slate-500">
            {asset.systemCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/assets/${asset.id}/qr`}>
            <Button variant="outline">
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </Link>
          {canEdit && (
            <>
              <Link href={`/assets/${asset.id}/edit`}>
                <Button>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <DeleteAssetButton assetId={asset.id} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Tipe" value={ASSET_TYPE_LABELS[asset.assetType]} />
            <Row label="Kategori" value={asset.category.name} />
            <Row label="Kondisi" value={CONDITION_LABELS[asset.condition]} />
            <Row label="Deskripsi" value={asset.description} />
            {isDigital ? (
              <>
                <Row label="Domain" value={asset.domain} />
                <Row
                  label="Kadaluarsa"
                  value={asset.expiryDate ? formatDate(asset.expiryDate) : "-"}
                />
              </>
            ) : (
              <>
                <Row label="Merk" value={asset.brand?.name} />
                <Row label="Model" value={asset.model} />
                <Row label="Serial Number" value={asset.serialNumber} />
                <Row label="Warna" value={asset.color} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kepemilikan & Lokasi</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Owner / PIC" value={asset.owner?.name} />
            <Row label="Lokasi" value={asset.location?.name} />
            <Row label="Dibuat oleh" value={asset.createdBy.name} />
            <Row label="Tanggal dibuat" value={formatDate(asset.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keuangan & Penyusutan</CardTitle>
          </CardHeader>
          <CardContent>
            <Row
              label="Tanggal Pembelian"
              value={asset.purchaseDate ? formatDate(asset.purchaseDate) : "-"}
            />
            <Row
              label="Harga Pembelian"
              value={formatCurrency(asset.purchasePrice?.toString())}
            />
            <Row
              label="Nilai Saat Ini"
              value={formatCurrency(asset.currentValue?.toString())}
            />
            <Row
              label="Nilai Sisa"
              value={formatCurrency(asset.salvageValue?.toString())}
            />
            <Row
              label="Umur Ekonomis"
              value={asset.usefulLifeYears ? `${asset.usefulLifeYears} tahun` : "-"}
            />
            <Row
              label="Metode Penyusutan"
              value={DEPRECIATION_LABELS[asset.depreciationMethod]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Perawatan</CardTitle>
          </CardHeader>
          <CardContent>
            {asset.maintenances.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada perawatan.</p>
            ) : (
              asset.maintenances.map((m) => (
                <Row
                  key={m.id}
                  label={m.title}
                  value={formatDate(m.scheduledDate)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
