import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default async function NewTransactionPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/assets");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Ajukan Transaksi"
        description="Ajukan mutasi, penghapusan, atau serah terima aset."
      />
      <TransactionForm />
    </div>
  );
}
