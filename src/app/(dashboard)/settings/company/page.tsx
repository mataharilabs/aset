import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { countAppUsers } from "@/lib/sso-client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CompanyEditButton } from "@/components/settings/CompanyEditButton";
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
  if (!isManagerUp(user.role)) redirect("/dashboard");
  const isSuper = user.role === "SUPER_ADMIN";

  const [company, assetCount, ssoUserCount] = await Promise.all([
    prisma.company.findUnique({ where: { id: user.companyId } }),
    prisma.asset.count({ where: { companyId: user.companyId } }),
    countAppUsers({ companyId: user.ssoCompanyId }),
  ]);

  // Fallback ke hitungan lokal bila SSO tak terjangkau
  const userCount =
    ssoUserCount ??
    (await prisma.user.count({ where: { companyId: user.companyId } }));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Profil Perusahaan"
        description={
          isSuper
            ? "Informasi perusahaan Anda."
            : "Informasi perusahaan (edit hanya untuk Super Admin)."
        }
        action={
          company ? (
            <CompanyEditButton
              canEdit={isSuper}
              company={{
                name: company.name,
                email: company.email,
                phone: company.phone,
                address: company.address,
              }}
            />
          ) : undefined
        }
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
          <Row
            label="Jumlah Pengguna (SSO)"
            value={`${userCount}${ssoUserCount === null ? " (lokal)" : ""}`}
          />
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
