import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasterManager } from "@/components/master/MasterManager";

export default async function BrandsPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  return (
    <div>
      <PageHeader title="Merk" description="Kelola merk / brand aset." />
      <MasterManager
        endpoint="/api/master/brands"
        entityLabel="Merk"
        fields={[{ name: "name", label: "Nama Merk", required: true }]}
        columns={[
          { key: "name", label: "Nama" },
          { key: "_count.assets", label: "Jumlah Aset" },
        ]}
      />
    </div>
  );
}
