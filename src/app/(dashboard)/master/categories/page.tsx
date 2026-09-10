import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasterManager } from "@/components/master/MasterManager";
import { ASSET_TYPE_LABELS } from "@/lib/constants";

export default async function CategoriesPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Kategori"
        description="Kelola kategori aset. Tentukan tipe agar muncul sesuai saat menambah aset."
      />
      <MasterManager
        endpoint="/api/master/categories"
        entityLabel="Kategori"
        fields={[
          { name: "name", label: "Nama Kategori", required: true },
          {
            name: "assetType",
            label: "Tipe Aset",
            type: "select",
            options: [
              { value: "", label: "Semua Tipe" },
              { value: "PHYSICAL", label: "Fisik" },
              { value: "DIGITAL", label: "Digital" },
            ],
          },
          { name: "description", label: "Deskripsi", type: "textarea" },
        ]}
        columns={[
          { key: "name", label: "Nama" },
          { key: "assetType", label: "Tipe", map: { ...ASSET_TYPE_LABELS } },
          { key: "description", label: "Deskripsi" },
          { key: "_count.assets", label: "Jumlah Aset" },
        ]}
      />
    </div>
  );
}
