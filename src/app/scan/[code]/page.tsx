import Link from "next/link";
import {
  Package,
  Monitor,
  Box,
  MapPin,
  Tag,
  ShieldCheck,
  Award,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { Card, CardContent } from "@/components/ui/card";
import { AssetStatusBadge } from "@/components/assets/AssetStatusBadge";
import { ASSET_TYPE_LABELS, CONDITION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

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
              </div>

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
