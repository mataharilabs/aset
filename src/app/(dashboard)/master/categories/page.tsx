import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasterManager } from "@/components/master/MasterManager";

export default async function CategoriesPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Kategori"
        description="Kelola kategori aset (fisik & digital)."
      />
      <MasterManager
        endpoint="/api/master/categories"
        entityLabel="Kategori"
        fields={[
          { name: "name", label: "Nama Kategori", required: true },
          { name: "description", label: "Deskripsi", type: "textarea" },
        ]}
        columns={[
          { key: "name", label: "Nama" },
          { key: "description", label: "Deskripsi" },
          { key: "_count.assets", label: "Jumlah Aset" },
        ]}
      />
    </div>
  );
}
