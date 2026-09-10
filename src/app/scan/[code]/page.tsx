import Link from "next/link";
import {
  Package,
  Monitor,
  Box,
  MapPin,
  Tag,
  ShieldCheck,
  Award,
  UserCircle,
  Calendar,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { Card, CardContent } from "@/components/ui/card";
import { AssetStatusBadge } from "@/components/assets/AssetStatusBadge";
import {
  ASSET_TYPE_LABELS,
  CONDITION_LABELS,
  MAINTENANCE_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ScanLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const asset = await prisma.asset.findUnique({
    where: { systemCode: decodeURIComponent(code) },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
      location: { select: { name: true } },
      owner: { select: { name: true } },
      company: { select: { name: true } },
      maintenances: {
        orderBy: { scheduledDate: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          scheduledDate: true,
          status: true,
        },
      },
    },
  });

  // Catat scan bila ada user login pada company yang sama
  const user = await getCurrentUser();
  if (asset && user && user.companyId === asset.companyId) {
    await logAudit({
      companyId: asset.companyId,
      userId: user.id,
      action: "SCAN",
      entityType: "Asset",
      entityId: asset.id,
      assetId: asset.id,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-brand-700">
          <Package className="h-6 w-6" />
          <span className="text-lg font-bold">ASET</span>
        </div>

        {!asset ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-semibold text-slate-800">
                Aset tidak ditemukan
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Kode <span className="font-mono">{code}</span> tidak terdaftar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {asset.assetType === "DIGITAL" ? (
                      <Monitor className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Box className="h-5 w-5 text-slate-400" />
                    )}
                    <h1 className="text-xl font-bold text-slate-900">
                      {asset.name}
                    </h1>
                  </div>
                  <p className="mt-1 font-mono text-sm text-slate-500">
                    {asset.systemCode}
                  </p>
                </div>
                <AssetStatusBadge status={asset.status} />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <Info icon={Tag} label="Kategori" value={asset.category.name} />
                <Info
                  icon={Package}
                  label="Tipe"
                  value={ASSET_TYPE_LABELS[asset.assetType]}
                />
                <Info
                  icon={ShieldCheck}
                  label="Kondisi"
                  value={CONDITION_LABELS[asset.condition]}
                />
                {asset.location && (
                  <Info
                    icon={MapPin}
                    label="Lokasi"
                    value={asset.location.name}
                  />
                )}
                {asset.brand && (
                  <Info icon={Award} label="Merk" value={asset.brand.name} />
                )}
                {asset.owner && (
                  <Info
                    icon={UserCircle}
                    label="Owner / PIC"
                    value={asset.owner.name}
                  />
                )}
                {asset.purchaseDate && (
                  <Info
                    icon={Calendar}
                    label="Tgl Pembelian"
                    value={formatDate(asset.purchaseDate)}
                  />
                )}
                {asset.purchasePrice && (
                  <Info
                    icon={Wallet}
                    label="Harga Beli"
                    value={formatCurrency(asset.purchasePrice.toString())}
                  />
                )}
              </div>

              {asset.maintenances.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Wrench className="h-3.5 w-3.5" />
                    Riwayat Perawatan
                  </div>
                  {asset.maintenances.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate text-slate-700">
                        {m.title}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDate(m.scheduledDate)} ·{" "}
                        {MAINTENANCE_STATUS_LABELS[m.status] ?? m.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-400">
                {asset.company.name} · Terdaftar {formatDate(asset.createdAt)}
              </div>

              {user && user.companyId === asset.companyId && (
                <Link
                  href={`/assets/${asset.id}`}
                  className="block rounded-lg bg-brand-600 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                >
                  Lihat Detail Lengkap
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
