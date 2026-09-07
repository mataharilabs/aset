"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function ApproveActions({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"APPROVE" | "REJECT" | null>(null);

  async function act(action: "APPROVE" | "REJECT") {
    setLoading(action);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error ?? "Gagal");
      toast(
        `Transaksi ${action === "APPROVE" ? "disetujui" : "ditolak"}`,
        "success"
      );
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Catatan (opsional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button
          variant="success"
          onClick={() => act("APPROVE")}
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
          onClick={() => act("REJECT")}
          disabled={loading !== null}
        >
          {loading === "REJECT" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          Tolak
        </Button>
      </div>
    </div>
  );
}
