import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { QRLabel } from "@/components/qr/QRLabel";

export default async function AssetQrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const asset = await prisma.asset.findFirst({
    where: { id, companyId: user.companyId },
    select: { id: true, systemCode: true, name: true },
  });
  if (!asset) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 no-print">
        <Link
          href={`/assets/${asset.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke detail aset
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 no-print">
        QR Code Aset
      </h1>
      <Card>
        <CardContent className="pt-6">
          <QRLabel
            systemCode={asset.systemCode}
            name={asset.name}
            companyName={user.companyName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
