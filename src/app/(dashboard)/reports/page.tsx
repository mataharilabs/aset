import Link from "next/link";
import { redirect } from "next/navigation";
import { FileBarChart, TrendingDown, ChevronRight } from "lucide-react";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExportButton } from "@/components/reports/ExportButton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ASSET_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  const [byCategory, byStatus, valueAgg] = await Promise.all([
    prisma.asset.groupBy({
      by: ["categoryId"],
      where: { companyId: user.companyId },
      _count: true,
    }),
    prisma.asset.groupBy({
      by: ["status"],
      where: { companyId: user.companyId },
      _count: true,
    }),
    prisma.asset.aggregate({
      where: { companyId: user.companyId },
      _sum: { purchasePrice: true, currentValue: true },
    }),
  ]);

  const categories = await prisma.category.findMany({
    where: { companyId: user.companyId },
    select: { id: true, name: true },
  });
  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "-";

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Ringkasan & ekspor data aset."
        action={<ExportButton />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total Harga Perolehan</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(valueAgg._sum.purchasePrice?.toString())}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total Nilai Buku Kini</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(valueAgg._sum.currentValue?.toString())}
          </p>
        </Card>
      </div>

      <Link href="/reports/depreciation">
        <Card className="mb-6 flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900">
              Laporan Penyusutan
            </div>
            <div className="text-sm text-slate-500">
              Jadwal penyusutan nilai aset per tahun
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </Card>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aset per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byCategory.map((c) => (
                  <TableRow key={c.categoryId}>
                    <TableCell>{catName(c.categoryId)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {c._count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aset per Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byStatus.map((s) => (
                  <TableRow key={s.status}>
                    <TableCell>
                      {ASSET_STATUS_LABELS[s.status] ?? s.status}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {s._count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
