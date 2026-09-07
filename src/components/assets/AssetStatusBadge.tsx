import { Badge } from "@/components/ui/badge";
import { ASSET_STATUS_LABELS, ASSET_STATUS_COLORS } from "@/lib/constants";

export function AssetStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={ASSET_STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600"}
    >
      {ASSET_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
