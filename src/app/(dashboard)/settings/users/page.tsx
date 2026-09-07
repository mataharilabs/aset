import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersManager } from "@/components/settings/UsersManager";

export default async function UsersPage() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");
  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola pengguna, role, dan status akun."
      />
      <UsersManager currentUserId={user.id} />
    </div>
  );
}
