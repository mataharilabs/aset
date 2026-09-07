import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasterManager } from "@/components/master/MasterManager";

export default async function OwnersPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Owner / PIC"
        description="Kelola pemilik atau penanggung jawab aset."
      />
      <MasterManager
        endpoint="/api/master/owners"
        entityLabel="Owner"
        fields={[
          { name: "name", label: "Nama", required: true },
          { name: "department", label: "Departemen" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Telepon" },
        ]}
        columns={[
          { key: "name", label: "Nama" },
          { key: "department", label: "Departemen" },
          { key: "email", label: "Email" },
          { key: "_count.assets", label: "Jumlah Aset" },
        ]}
      />
    </div>
  );
}
