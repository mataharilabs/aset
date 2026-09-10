import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AssetList } from "@/components/assets/AssetList";
import { ShareButton } from "@/components/assets/ShareButton";

export default async function AssetsPage() {
  const user = await requireUser();
  const canCreate = isManagerUp(user.role);

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { slug: true },
  });

  return (
    <div>
      <PageHeader
        title="Aset"
        description="Daftar seluruh aset fisik & digital perusahaan."
        action={
          <div className="flex items-center gap-2">
            {isManagerUp(user.role) && company && (
              <ShareButton slug={company.slug} />
            )}
            {canCreate && (
              <Link href="/assets/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Tambah Aset
                </Button>
              </Link>
            )}
          </div>
        }
      />
      <AssetList canCreate={canCreate} />
    </div>
  );
}
