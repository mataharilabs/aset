import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm, type UserFormInitial } from "@/components/settings/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireUser();
  if (admin.role !== "SUPER_ADMIN") redirect("/dashboard");
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, companyId: admin.companyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      reportsToId: true,
      profile: true,
    },
  });
  if (!user) notFound();

  // Serialize Date & Decimal agar aman dikirim ke client component
  const initial = JSON.parse(JSON.stringify(user)) as UserFormInitial;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <Link
          href="/settings/users"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar pengguna
        </Link>
      </div>
      <PageHeader
        title="Edit Pengguna"
        description={user.email}
      />
      <UserForm userId={user.id} initial={initial} />
    </div>
  );
}
