import { Badge } from "@/components/ui/badge";
import { TRANSACTION_STATUS_LABELS } from "@/lib/constants";

const COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
};

export function TransactionStatusBadge({ status }: { status: string }) {
  return (
    <Badge className={COLORS[status] ?? "bg-slate-100 text-slate-600"}>
      {TRANSACTION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
