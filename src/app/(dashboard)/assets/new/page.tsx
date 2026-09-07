import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssetForm } from "@/components/assets/AssetForm";

export default async function NewAssetPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/assets");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Tambah Aset"
        description="Isi detail aset baru. Kode aset akan dibuat otomatis."
      />
      <AssetForm />
    </div>
  );
}
