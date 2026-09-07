import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinancialClient } from "@/components/financial/FinancialClient";

export default async function FinancialPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");
  return (
    <div>
      <PageHeader
        title="Keuangan Aset"
        description="Pemasukan, pengeluaran, pajak, dan asuransi terkait aset."
      />
      <FinancialClient />
    </div>
  );
}
