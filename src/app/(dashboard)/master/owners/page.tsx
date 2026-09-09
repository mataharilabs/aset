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
        description="Owner/PIC adalah pengguna SSO ber-akses ASET: Asset Handler. Menambah Owner/PIC otomatis membuat akun di AsiaCommerce ID."
      />
      <MasterManager
        endpoint="/api/master/owners"
        entityLabel="Owner / PIC"
        disableEdit
        fields={[
          { name: "name", label: "Nama", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          {
            name: "password",
            label: "Password Awal",
            type: "password",
            required: true,
            placeholder: "Minimal 6 karakter",
          },
        ]}
        columns={[
          { key: "name", label: "Nama" },
          { key: "email", label: "Email" },
          { key: "_count.assets", label: "Jumlah Aset" },
        ]}
      />
    </div>
  );
}
