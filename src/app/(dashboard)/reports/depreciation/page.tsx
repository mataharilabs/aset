import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { TrendingDown } from "lucide-react";
import { computeDepreciation } from "@/lib/services/depreciation";
import { DEPRECIATION_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default async function DepreciationReportPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  const assets = await prisma.asset.findMany({
    where: {
      companyId: user.companyId,
      purchasePrice: { not: null },
      usefulLifeYears: { not: null },
    },
    select: {
      id: true,
      systemCode: true,
      name: true,
      purchasePrice: true,
      salvageValue: true,
      usefulLifeYears: true,
      depreciationMethod: true,
      purchaseDate: true,
    },
    orderBy: { systemCode: "asc" },
  });

  const now = new Date();
  const rows = assets.map((a) => {
    const cost = Number(a.purchasePrice);
    const salvage = Number(a.salvageValue ?? 0);
    const life = a.usefulLifeYears ?? 0;
    const schedule = computeDepreciation(
      cost,
      salvage,
      life,
      a.depreciationMethod
    );
    const yearsElapsed = a.purchaseDate
      ? Math.min(
          life,
          Math.max(
            0,
            now.getFullYear() - new Date(a.purchaseDate).getFullYear()
          )
        )
      : 0;
    const current = schedule[Math.max(0, yearsElapsed - 1)];
    const annual = schedule[0]?.depreciation ?? 0;
    return {
      ...a,
      cost,
      annual,
      accumulated: current?.accumulated ?? 0,
      bookValue: current?.closingValue ?? cost,
      yearsElapsed,
      life,
    };
  });

  return (
    <div>
      <div className="mb-4 no-print">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke laporan
        </Link>
      </div>
      <PageHeader
        title="Laporan Penyusutan"
        description="Estimasi penyusutan nilai aset berdasarkan metode masing-masing."
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title="Belum ada data penyusutan"
            description="Isi harga beli & umur ekonomis aset untuk menghitung penyusutan."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Harga Perolehan</TableHead>
                <TableHead className="text-right">Penyusutan/Tahun</TableHead>
                <TableHead className="text-right">Akumulasi</TableHead>
                <TableHead className="text-right">Nilai Buku</TableHead>
                <TableHead>Umur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">
                    {r.systemCode}
                  </TableCell>
                  <TableCell className="text-sm">{r.name}</TableCell>
                  <TableCell className="text-xs">
                    {DEPRECIATION_LABELS[r.depreciationMethod]}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(r.cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(r.annual)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-red-600">
                    {formatCurrency(r.accumulated)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(r.bookValue)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {r.yearsElapsed}/{r.life} th
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
