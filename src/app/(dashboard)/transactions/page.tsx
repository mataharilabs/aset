import Link from "next/link";
import { Plus, ArrowLeftRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
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
import { TransactionStatusBadge } from "@/components/transactions/TransactionStatusBadge";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function TransactionsPage() {
  const user = await requireUser();
  const items = await prisma.assetTransaction.findMany({
    where: { companyId: user.companyId },
    include: {
      asset: { select: { name: true, systemCode: true } },
      requestedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Transaksi Aset"
        description="Mutasi, penghapusan, dan serah terima aset dengan persetujuan."
        action={
          <Link href="/transactions/new">
            <Button>
              <Plus className="h-4 w-4" />
              Ajukan Transaksi
            </Button>
          </Link>
        }
      />
      <Card>
        {items.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Belum ada transaksi"
            description="Ajukan mutasi atau penghapusan aset."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Aset</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Pemohon</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/transactions/${t.id}`}
                      className="font-mono text-xs font-medium text-brand-600 hover:underline"
                    >
                      {t.transactionCode}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">
                    {t.asset.name}
                    <span className="block font-mono text-xs text-slate-400">
                      {t.asset.systemCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {TRANSACTION_TYPE_LABELS[t.type]}
                  </TableCell>
                  <TableCell className="text-sm">
                    {t.requestedBy.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(t.createdAt)}
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={t.status} />
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
