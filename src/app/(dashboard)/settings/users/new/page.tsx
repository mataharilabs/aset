import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm } from "@/components/settings/UserForm";

export default async function NewUserPage() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");

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
        title="Tambah Pengguna"
        description="Buat akun pengguna baru beserta data profil."
      />
      <UserForm />
    </div>
  );
}
