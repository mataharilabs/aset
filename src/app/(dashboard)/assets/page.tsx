import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AssetList } from "@/components/assets/AssetList";

export default async function AssetsPage() {
  const user = await requireUser();
  const canCreate = isManagerUp(user.role);

  return (
    <div>
      <PageHeader
        title="Aset"
        description="Daftar seluruh aset fisik & digital perusahaan."
        action={
          canCreate ? (
            <Link href="/assets/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tambah Aset
              </Button>
            </Link>
          ) : undefined
        }
      />
      <AssetList canCreate={canCreate} />
    </div>
  );
}
