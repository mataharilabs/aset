"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Ban, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

type Role = "SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER";
type Action = "APPROVE" | "REJECT" | "CANCEL" | "DELETE";

export function ApproveActions({
  transactionId,
  status,
  role,
}: {
  transactionId: string;
  status: string;
  role: Role;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<Action | null>(null);

  const isSuper = role === "SUPER_ADMIN";
  const isPending = status === "PENDING";
  const canApproveReject = isSuper && isPending;
  const canCancel = (isSuper || role === "ASSET_MANAGER") && isPending;
  const canDelete = isSuper;

  async function run(action: Action) {
    if (action === "DELETE" && !confirm("Hapus transaksi ini permanen?")) return;
    setLoading(action);
    try {
      let res: Response;
      if (action === "DELETE") {
        res = await fetch(`/api/transactions/${transactionId}`, {
          method: "DELETE",
        });
      } else if (action === "CANCEL") {
        res = await fetch(`/api/transactions/${transactionId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });
      } else {
        res = await fetch(`/api/transactions/${transactionId}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, notes }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error ?? "Gagal");
      toast("Berhasil diproses", "success");
      if (action === "DELETE") {
        router.push("/transactions");
      }
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(null);
    }
  }

  const anyActionable = canApproveReject || canCancel || canDelete;
  if (!anyActionable) {
    return (
      <p className="text-sm text-slate-400">
        Tidak ada tindakan tersedia untuk status ini.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {(canApproveReject || canCancel) && (
        <div className="space-y-1.5">
          <Label>Catatan (opsional)</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {canApproveReject && (
          <>
            <Button
              variant="success"
              onClick={() => run("APPROVE")}
              disabled={loading !== null}
            >
              {loading === "APPROVE" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Setujui
            </Button>
            <Button
              variant="destructive"
              onClick={() => run("REJECT")}
              disabled={loading !== null}
            >
              {loading === "REJECT" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Tolak
            </Button>
          </>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={() => run("CANCEL")}
            disabled={loading !== null}
          >
            {loading === "CANCEL" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Batalkan
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            onClick={() => run("DELETE")}
            disabled={loading !== null}
            className="text-red-600 hover:bg-red-50"
          >
            {loading === "DELETE" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Hapus
          </Button>
        )}
      </div>
    </div>
  );
}
