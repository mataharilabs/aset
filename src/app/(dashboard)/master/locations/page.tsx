import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { syncOfficesFromSSO } from "@/lib/office-sync";
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

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  await syncOfficesFromSSO(user.companyId, user.ssoCompanyId);
  const locations = await prisma.location.findMany({
    where: { companyId: user.companyId },
    include: { _count: { select: { assets: true } } },
    orderBy: { name: "asc" },
  });

  const ssoUrl = process.env.SSO_URL ?? "https://sso.asiacommerce.net";

  return (
    <div>
      <PageHeader
        title="Lokasi"
        description="Lokasi aset mengikuti master Lokasi Kantor di SSO."
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-brand-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Daftar lokasi ini bersumber dari master{" "}
          <strong>Lokasi Kantor</strong> di SSO dan bersifat baca-saja. Untuk
          menambah, mengubah, atau menghapus lokasi, silakan kelola di{" "}
          <a
            href={`${ssoUrl}/offices`}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-2"
          >
            SSO → Lokasi Kantor
          </a>
          .
        </p>
      </div>

      <Card>
        {locations.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Belum ada Lokasi Kantor di SSO. Tambahkan dulu di SSO → Lokasi
            Kantor.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="text-right">Jumlah Aset</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-slate-800">
                    {l.name}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {l.address ?? "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {l._count.assets}
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
