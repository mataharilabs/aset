import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasterManager } from "@/components/master/MasterManager";

export default async function LocationsPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Lokasi"
        description="Kelola lokasi penyimpanan / penempatan aset."
      />
      <MasterManager
        endpoint="/api/master/locations"
        entityLabel="Lokasi"
        fields={[
          { name: "name", label: "Nama Lokasi", required: true },
          { name: "address", label: "Alamat", type: "textarea" },
        ]}
        columns={[
          { key: "name", label: "Nama" },
          { key: "address", label: "Alamat" },
          { key: "_count.assets", label: "Jumlah Aset" },
        ]}
      />
    </div>
  );
}
