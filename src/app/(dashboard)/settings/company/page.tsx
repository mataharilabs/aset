import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-50 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">
        {value ?? "-"}
      </span>
    </div>
  );
}

export default async function CompanyPage() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const [company, userCount, assetCount] = await Promise.all([
    prisma.company.findUnique({ where: { id: user.companyId } }),
    prisma.user.count({ where: { companyId: user.companyId } }),
    prisma.asset.count({ where: { companyId: user.companyId } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Profil Perusahaan"
        description="Informasi perusahaan Anda."
      />
      <Card>
        <CardHeader>
          <CardTitle>{company?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Nama" value={company?.name} />
          <Row label="Slug" value={company?.slug} />
          <Row label="Email" value={company?.email} />
          <Row label="Telepon" value={company?.phone} />
          <Row label="Alamat" value={company?.address} />
          <Row label="Jumlah Pengguna" value={userCount} />
          <Row label="Jumlah Aset" value={assetCount} />
          <Row
            label="Terdaftar"
            value={company ? formatDate(company.createdAt) : "-"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
