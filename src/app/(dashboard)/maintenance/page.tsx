import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { MaintenanceClient } from "@/components/maintenance/MaintenanceClient";

export default async function MaintenancePage() {
  const user = await requireUser();
  return (
    <div>
      <PageHeader
        title="Perawatan"
        description="Jadwal & riwayat perawatan aset."
      />
      <MaintenanceClient canManage={isManagerUp(user.role)} />
    </div>
  );
}
