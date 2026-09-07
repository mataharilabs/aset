import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default async function NewTransactionPage() {
  await requireUser();
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
