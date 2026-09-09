import Link from "next/link";
import {
  Package,
  CheckCircle2,
  Wrench,
  ArrowLeftRight,
  Clock,
  Wallet,
} from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASSET_STATUS_LABELS, ASSET_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  // ASSET_HANDLER tidak punya dashboard → langsung ke daftar aset miliknya
  if (!isManagerUp(user.role)) redirect("/assets");
  const companyId = user.companyId;

  const [
    totalAssets,
    activeAssets,
    inMaintenance,
    pendingTxns,
    upcomingMaint,
    totalValueAgg,
    recentAssets,
    byStatus,
  ] = await Promise.all([
    prisma.asset.count({ where: { companyId } }),
    prisma.asset.count({ where: { companyId, status: "ACTIVE" } }),
    prisma.asset.count({ where: { companyId, status: "IN_MAINTENANCE" } }),
    prisma.assetTransaction.count({ where: { companyId, status: "PENDING" } }),
    prisma.maintenance.findMany({
      where: { companyId, status: { in: ["SCHEDULED", "OVERDUE"] } },
      orderBy: { scheduledDate: "asc" },
      take: 5,
      include: { asset: { select: { name: true, systemCode: true } } },
    }),
    prisma.asset.aggregate({
      where: { companyId },
      _sum: { currentValue: true },
    }),
    prisma.asset.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
    prisma.asset.groupBy({
      by: ["status"],
      where: { companyId },
      _count: true,
    }),
  ]);

  const totalValue = totalValueAgg._sum.currentValue?.toString() ?? "0";

  return (
    <div>
      <PageHeader
        title={`Halo, ${user.name ?? "User"} 👋`}
        description="Ringkasan aset dan aktivitas perusahaan Anda."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Aset"
          value={totalAssets}
          icon={Package}
          accent="brand"
        />
        <StatCard
          label="Aset Aktif"
          value={activeAssets}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Dalam Perawatan"
          value={inMaintenance}
          icon={Wrench}
          accent="amber"
        />
        <StatCard
          label="Transaksi Pending"
          value={pendingTxns}
          icon={ArrowLeftRight}
          accent="violet"
        />
      </div>

      <div className="mt-4">
        <StatCard
          label="Total Nilai Aset (saat ini)"
          value={formatCurrency(totalValue)}
          icon={Wallet}
          accent="emerald"
          hint="Berdasarkan nilai buku terkini seluruh aset"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Distribusi status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Aset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byStatus.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada data aset.</p>
            )}
            {byStatus.map((s) => (
              <div
                key={s.status}
                className="flex items-center justify-between"
              >
                <Badge
                  className={
                    ASSET_STATUS_COLORS[s.status] ??
                    "bg-slate-100 text-slate-600"
                  }
                >
                  {ASSET_STATUS_LABELS[s.status] ?? s.status}
                </Badge>
                <span className="text-sm font-semibold text-slate-700">
                  {s._count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Perawatan mendatang */}
        <Card>
          <CardHeader>
            <CardTitle>Perawatan Mendatang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMaint.length === 0 && (
              <p className="text-sm text-slate-400">
                Tidak ada jadwal perawatan.
              </p>
            )}
            {upcomingMaint.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {m.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {m.asset.name} · {m.asset.systemCode}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(m.scheduledDate)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Aset terbaru */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aset Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentAssets.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada aset.</p>
          )}
          {recentAssets.map((a) => (
            <Link
              key={a.id}
              href={`/assets/${a.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {a.name}
                </p>
                <p className="text-xs text-slate-400">
                  {a.systemCode} · {a.category.name}
                </p>
              </div>
              <Badge
                className={
                  ASSET_STATUS_COLORS[a.status] ??
                  "bg-slate-100 text-slate-600"
                }
              >
                {ASSET_STATUS_LABELS[a.status] ?? a.status}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
