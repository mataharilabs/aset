import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TransactionStatusBadge } from "@/components/transactions/TransactionStatusBadge";
import { ApproveActions } from "@/components/transactions/ApproveActions";
import {
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

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

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/assets");
  const { id } = await params;

  const txn = await prisma.assetTransaction.findFirst({
    where: { id, companyId: user.companyId },
    include: {
      asset: { select: { name: true, systemCode: true, id: true } },
      requestedBy: { select: { name: true } },
      targetLocation: { select: { name: true } },
    },
  });
  if (!txn) notFound();

  const isPending = txn.status === "PENDING";
  const showActions =
    (isPending && isManagerUp(user.role)) || user.role === "SUPER_ADMIN";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar transaksi
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold text-slate-900">
            {txn.transactionCode}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {TRANSACTION_TYPE_LABELS[txn.type]}
          </p>
        </div>
        <TransactionStatusBadge status={txn.status} />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <Row
              label="Aset"
              value={
                <Link
                  href={`/assets/${txn.asset.id}`}
                  className="text-brand-600 hover:underline"
                >
                  {txn.asset.name} ({txn.asset.systemCode})
                </Link>
              }
            />
            <Row label="Pemohon" value={txn.requestedBy.name} />
            <Row label="Diajukan" value={formatDateTime(txn.createdAt)} />
            {txn.targetLocation && (
              <Row label="Lokasi Tujuan" value={txn.targetLocation.name} />
            )}
            {txn.disposalReason && (
              <Row label="Alasan Penghapusan" value={txn.disposalReason} />
            )}
            {txn.disposalValue && (
              <Row
                label="Nilai Pelepasan"
                value={formatCurrency(txn.disposalValue.toString())}
              />
            )}
            {txn.notes && <Row label="Catatan" value={txn.notes} />}
          </CardContent>
        </Card>

        {showActions && (
          <Card>
            <CardHeader>
              <CardTitle>Tindakan</CardTitle>
            </CardHeader>
            <CardContent>
              <ApproveActions
                transactionId={txn.id}
                status={txn.status}
                role={user.role}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
